const express = require('express');
const db = require('../config/db');
const authenticate = require('../middleware/authenticate');
const privilegeMiddleware = require('../middleware/privilegeMiddleware');
const multer = require('multer');
const path = require('path');

// Export a function that accepts the io instance
module.exports = (io) => {
  const router = express.Router();

// Configure multer for chat file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/chat-files/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allow images and documents
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|xlsx|xls/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  }
});

// Get user's chat rooms
router.get('/rooms', authenticate, async (req, res) => {
  try {
    const userId = req.user.id || req.user.actualUserId;
    console.log('Fetching rooms for user:', userId);
    
    const query = `
      SELECT DISTINCT 
        r.room_id,
        r.room_name,
        r.room_type,
        r.description,
        r.project_id,
        r.role_id,
        r.created_at,
        p.projectName as project_name,
        ro.roleName as role_name,
        (SELECT COUNT(*) FROM chat_room_participants WHERE room_id = r.room_id) as participant_count,
        (SELECT COUNT(*) FROM chat_messages WHERE room_id = r.room_id AND created_at > COALESCE(crp.last_read_at, '1970-01-01')) as unread_count,
        (SELECT message_text FROM chat_messages WHERE room_id = r.room_id ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM chat_messages WHERE room_id = r.room_id ORDER BY created_at DESC LIMIT 1) as last_message_time
      FROM chat_rooms r
      INNER JOIN chat_room_participants crp ON r.room_id = crp.room_id AND crp.user_id = ?
      LEFT JOIN projects p ON r.project_id = p.id
      LEFT JOIN roles ro ON r.role_id = ro.roleId
      WHERE r.is_active = 1
      ORDER BY last_message_time DESC, r.created_at DESC
    `;
    
    const [rooms] = await db.execute(query, [userId]);
    res.json({ success: true, rooms });
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch chat rooms' });
  }
});

// Create new chat room
router.post('/rooms', authenticate, privilegeMiddleware(['chat.create_room']), async (req, res) => {
  try {
    const { room_name, room_type, description, project_id, role_id, participant_ids } = req.body;
    const userId = req.user.id || req.user.actualUserId;
    
    console.log('Creating room with data:', { room_name, room_type, description, project_id, role_id, participant_ids, userId });
    
    // Insert new room
    const [result] = await db.execute(
      'INSERT INTO chat_rooms (room_name, room_type, description, project_id, role_id, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [room_name, room_type, description, project_id === null ? null : project_id, role_id === null ? null : role_id, userId]
    );
    
    const roomId = result.insertId;
    
    // Add creator as admin participant
    await db.execute(
      'INSERT INTO chat_room_participants (room_id, user_id, is_admin) VALUES (?, ?, 1)',
      [roomId, userId]
    );
    
    // For role-based rooms, automatically add all users with that role
    if (room_type === 'role' && role_id) {
      console.log('Adding all users with role_id:', role_id);
      const [usersWithRole] = await db.execute(
        'SELECT userId FROM users WHERE roleId = ?',
        [role_id]
      );
      
      for (const user of usersWithRole) {
        // Skip the creator as they're already added as admin
        if (user.userId !== userId) {
          await db.execute(
            'INSERT INTO chat_room_participants (room_id, user_id, is_admin) VALUES (?, ?, 0)',
            [roomId, user.userId]
          );
        }
      }
    }
    
    // Add other participants if provided (for non-role rooms)
    if (participant_ids && participant_ids.length > 0 && room_type !== 'role') {
      console.log('Adding participants:', participant_ids);
      for (const participantId of participant_ids) {
        await db.execute(
          'INSERT INTO chat_room_participants (room_id, user_id, is_admin) VALUES (?, ?, 0)',
          [roomId, participantId]
        );
      }
    }
    
    res.json({ success: true, room_id: roomId, message: 'Chat room created successfully' });
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({ success: false, message: 'Failed to create chat room' });
  }
});

// Get messages for a specific room
router.get('/rooms/:roomId/messages', authenticate, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id || req.user.actualUserId;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const offset = Math.max(0, (pageNum - 1) * limitNum);
    const roomIdNum = parseInt(roomId);
    
    console.log('Parsed parameters:', { pageNum, limitNum, offset, roomIdNum });
    
    // Check if user has access to this room
    const [access] = await db.execute(
      'SELECT 1 FROM chat_room_participants WHERE room_id = ? AND user_id = ?',
      [roomIdNum, userId]
    );
    
    if (access.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied to this chat room' });
    }
    
    // Simplified query without LIMIT/OFFSET to test
    const query = `
      SELECT 
        m.message_id,
        m.message_text,
        m.message_type,
        m.file_url,
        m.file_name,
        m.file_size,
        m.reply_to_message_id,
        m.created_at,
        m.edited_at,
        m.sender_id,
        u.firstName,
        u.lastName,
        u.email
      FROM chat_messages m
      LEFT JOIN users u ON m.sender_id = u.userId
      WHERE m.room_id = ? AND m.is_deleted = 0
      ORDER BY m.created_at DESC
    `;
    
    console.log('Executing simplified query with parameters:', { roomId: roomIdNum });
    console.log('Parameter types:', { roomIdType: typeof roomIdNum });
    const [allMessages] = await db.execute(query, [roomIdNum]);
    
    // Debug: Log message structure
    if (allMessages.length > 0) {
      console.log('API - Sample message from room', roomIdNum, ':', {
        message_id: allMessages[0].message_id,
        sender_id: allMessages[0].sender_id,
        firstName: allMessages[0].firstName,
        lastName: allMessages[0].lastName,
        email: allMessages[0].email,
        message_text: allMessages[0].message_text?.substring(0, 20) + '...'
      });
    }
    
    // Apply pagination manually
    const startIndex = offset;
    const endIndex = startIndex + limitNum;
    const messages = allMessages.slice(startIndex, endIndex);
    
    // Update last read timestamp
    await db.execute(
      'UPDATE chat_room_participants SET last_read_at = NOW() WHERE room_id = ? AND user_id = ?',
      [roomIdNum, userId]
    );
    
    res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

// Send message to a room
router.post('/rooms/:roomId/messages', authenticate, privilegeMiddleware(['chat.send_message']), async (req, res) => {
  try {
    const { roomId } = req.params;
    const { message_text, message_type = 'text', reply_to_message_id } = req.body;
    const userId = req.user.id || req.user.actualUserId;
    
    // Check if user has access to this room
    const [access] = await db.execute(
      'SELECT 1 FROM chat_room_participants WHERE room_id = ? AND user_id = ?',
      [roomId, userId]
    );
    
    if (access.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied to this chat room' });
    }
    
    // Insert message
    const [result] = await db.execute(
      'INSERT INTO chat_messages (room_id, sender_id, message_text, message_type, reply_to_message_id) VALUES (?, ?, ?, ?, ?)',
      [roomId, userId, message_text, message_type, reply_to_message_id || null]
    );
    
    // Get the complete message data for real-time broadcast
    const [messageData] = await db.execute(`
      SELECT 
        m.message_id,
        m.message_text,
        m.message_type,
        m.created_at,
        m.reply_to_message_id,
        u.firstName,
        u.lastName,
        u.email
      FROM chat_messages m
      LEFT JOIN users u ON m.sender_id = u.userId
      WHERE m.message_id = ?
    `, [result.insertId]);
    
    res.json({ 
      success: true, 
      message_id: result.insertId,
      message: 'Message sent successfully',
      messageData: messageData[0]
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// Upload file to chat
router.post('/rooms/:roomId/upload', authenticate, privilegeMiddleware(['chat.upload_file']), upload.single('file'), async (req, res) => {
  try {
    console.log('File upload request received');
    console.log('Room ID:', req.params.roomId);
    console.log('User ID:', req.user.id || req.user.actualUserId);
    console.log('File:', req.file);
    
    const { roomId } = req.params;
    const userId = req.user.id || req.user.actualUserId;
    const file = req.file;
    
    if (!file) {
      console.log('No file uploaded');
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Check if user has access to this room
    const [access] = await db.execute(
      'SELECT 1 FROM chat_room_participants WHERE room_id = ? AND user_id = ?',
      [roomId, userId]
    );
    
    if (access.length === 0) {
      console.log('Access denied for user', userId, 'to room', roomId);
      return res.status(403).json({ success: false, message: 'Access denied to this chat room' });
    }
    
    console.log('Access granted, processing file upload');
    const fileUrl = `/uploads/chat-files/${file.filename}`;
    const messageType = file.mimetype.startsWith('image/') ? 'image' : 'file';
    
    console.log('File URL:', fileUrl);
    console.log('Message type:', messageType);
    
    // Insert file message
    const [result] = await db.execute(
      'INSERT INTO chat_messages (room_id, sender_id, message_type, file_url, file_name, file_size) VALUES (?, ?, ?, ?, ?, ?)',
      [roomId, userId, messageType, fileUrl, file.originalname, file.size]
    );
    
    console.log('File message inserted with ID:', result.insertId);
    
    // Get complete message data for broadcasting
    const [messageData] = await db.execute(`
      SELECT 
        m.message_id,
        m.message_text,
        m.message_type,
        m.created_at,
        m.file_url,
        m.file_name,
        m.file_size,
        u.firstName,
        u.lastName,
        m.sender_id
      FROM chat_messages m
      LEFT JOIN users u ON m.sender_id = u.userId
      WHERE m.message_id = ?
    `, [result.insertId]);
    
    if (messageData.length > 0) {
      console.log('Broadcasting file message to room:', roomId);
      // Broadcast to all users in the room
      io.to(`room_${roomId}`).emit('new_message', messageData[0]);
    }
    
    res.json({ 
      success: true, 
      message_id: result.insertId,
      file_url: fileUrl,
      file_name: file.originalname,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ success: false, message: 'Failed to upload file' });
  }
});

// Join a chat room
router.post('/rooms/:roomId/join', authenticate, privilegeMiddleware(['chat.join_room']), async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id || req.user.actualUserId;
    
    // Check if room exists and is active
    const [room] = await db.execute(
      'SELECT room_type FROM chat_rooms WHERE room_id = ? AND is_active = 1',
      [roomId]
    );
    
    if (room.length === 0) {
      return res.status(404).json({ success: false, message: 'Chat room not found' });
    }
    
    // Check if already a participant
    const [existing] = await db.execute(
      'SELECT 1 FROM chat_room_participants WHERE room_id = ? AND user_id = ?',
      [roomId, userId]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Already a member of this room' });
    }
    
    // Add user to room
    await db.execute(
      'INSERT INTO chat_room_participants (room_id, user_id) VALUES (?, ?)',
      [roomId, userId]
    );
    
    res.json({ success: true, message: 'Joined chat room successfully' });
  } catch (error) {
    console.error('Error joining chat room:', error);
    res.status(500).json({ success: false, message: 'Failed to join chat room' });
  }
});

// Leave a chat room
router.delete('/rooms/:roomId/leave', authenticate, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id || req.user.actualUserId;
    
    // Remove user from room
    const [result] = await db.execute(
      'DELETE FROM chat_room_participants WHERE room_id = ? AND user_id = ?',
      [roomId, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Not a member of this room' });
    }
    
    res.json({ success: true, message: 'Left chat room successfully' });
  } catch (error) {
    console.error('Error leaving chat room:', error);
    res.status(500).json({ success: false, message: 'Failed to leave chat room' });
  }
});

// Get room participants
router.get('/rooms/:roomId/participants', authenticate, async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id || req.user.actualUserId;
    
    console.log('Fetching participants for room:', roomId, 'by user:', userId);
    
    // Check if user has access to this room
    const [access] = await db.execute(
      'SELECT 1 FROM chat_room_participants WHERE room_id = ? AND user_id = ?',
      [roomId, userId]
    );
    
    console.log('Access check result:', access.length > 0 ? 'Granted' : 'Denied');
    
    if (access.length === 0) {
      console.log('Access denied for user', userId, 'to room', roomId);
      return res.status(403).json({ success: false, message: 'Access denied to this chat room' });
    }
    
    const query = `
      SELECT 
        u.userId,
        u.firstName,
        u.lastName,
        u.email,
        crp.joined_at,
        crp.is_admin,
        crp.is_muted
      FROM chat_room_participants crp
      LEFT JOIN users u ON crp.user_id = u.userId
      WHERE crp.room_id = ?
      ORDER BY crp.is_admin DESC, u.firstName ASC
    `;
    
    const [participants] = await db.execute(query, [roomId]);
    console.log('Found participants:', participants.length);
    console.log('Participants data:', participants);
    res.json({ success: true, participants });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch participants' });
  }
});

// Create role-based chat room for a specific role
router.post('/rooms/role/:roleId', authenticate, privilegeMiddleware(['chat.create_room']), async (req, res) => {
  try {
    const { roleId } = req.params;
    const userId = req.user.id || req.user.actualUserId;
    
    console.log('Creating role-based room for role_id:', roleId, 'by user:', userId);
    
    // Get role information
    const [roleInfo] = await db.execute(
      'SELECT roleName, description FROM roles WHERE roleId = ?',
      [roleId]
    );
    
    if (roleInfo.length === 0) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }
    
    const role = roleInfo[0];
    
    // Check if role-based room already exists
    const [existingRoom] = await db.execute(
      'SELECT room_id FROM chat_rooms WHERE room_type = "role" AND role_id = ? AND is_active = 1',
      [roleId]
    );
    
    if (existingRoom.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Role-based chat room already exists for this role',
        room_id: existingRoom[0].room_id
      });
    }
    
    // Create the role-based room
    const roomName = `${role.roleName} Discussion`;
    const description = `Discussion room for ${role.roleName} role members`;
    
    const [result] = await db.execute(
      'INSERT INTO chat_rooms (room_name, room_type, role_id, description, created_by) VALUES (?, ?, ?, ?, ?)',
      [roomName, 'role', roleId, description, userId]
    );
    
    const roomId = result.insertId;
    
    // Add creator as admin participant
    await db.execute(
      'INSERT INTO chat_room_participants (room_id, user_id, is_admin) VALUES (?, ?, 1)',
      [roomId, userId]
    );
    
    // Automatically add all users with this role
    const [usersWithRole] = await db.execute(
      'SELECT userId FROM users WHERE roleId = ?',
      [roleId]
    );
    
    for (const user of usersWithRole) {
      // Skip the creator as they're already added as admin
      if (user.userId !== userId) {
        await db.execute(
          'INSERT INTO chat_room_participants (room_id, user_id, is_admin) VALUES (?, ?, 0)',
          [roomId, user.userId]
        );
      }
    }
    
    res.json({ 
      success: true, 
      room_id: roomId, 
      message: `Role-based chat room created for ${role.roleName}`,
      room_name: roomName,
      participant_count: usersWithRole.length
    });
  } catch (error) {
    console.error('Error creating role-based chat room:', error);
    res.status(500).json({ success: false, message: 'Failed to create role-based chat room' });
  }
});

// Get all roles for creating role-based rooms
router.get('/roles', authenticate, async (req, res) => {
  try {
    const [roles] = await db.execute(
      'SELECT roleId, roleName, description FROM roles ORDER BY roleName'
    );
    res.json({ success: true, roles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch roles' });
  }
});

  return router;
};

