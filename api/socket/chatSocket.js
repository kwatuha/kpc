const jwt = require('jsonwebtoken');
const db = require('../config/db');

module.exports = (io) => {
  // Middleware for Socket.IO authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('Socket - Decoded token:', decoded); // Debug log
      
      let userId;
      if (decoded.user && decoded.user.id) {
        userId = decoded.user.id;
      } else if (decoded.user && decoded.user.actualUserId) {
        userId = decoded.user.actualUserId;
      } else if (decoded.user && decoded.user.userId) {
        userId = decoded.user.userId;
      } else if (decoded.userId) {
        userId = decoded.userId;
      } else {
        console.error('Socket - Invalid token structure:', decoded);
        console.error('Socket - Available keys in decoded:', Object.keys(decoded));
        console.error('Socket - Available keys in decoded.user:', decoded.user ? Object.keys(decoded.user) : 'No user object');
        return next(new Error('Invalid token payload'));
      }
      
      // Get user details from database
      const [users] = await db.execute(
        'SELECT userId, firstName, lastName, email FROM users WHERE userId = ?',
        [userId]
      );
      
      if (users.length === 0) {
        return next(new Error('User not found'));
      }
      
      socket.user = users[0];
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.firstName} ${socket.user.lastName} connected to chat`);
    
    // Join user to their personal room for direct messages
    socket.join(`user_${socket.user.userId}`);
    
    // Join user to all their chat rooms
    socket.on('join_rooms', async () => {
      try {
        const [rooms] = await db.execute(`
          SELECT DISTINCT r.room_id 
          FROM chat_rooms r
          LEFT JOIN chat_room_participants crp ON r.room_id = crp.room_id
          WHERE r.is_active = 1 
            AND (crp.user_id = ? OR r.room_type = 'group')
        `, [socket.user.userId]);
        
        rooms.forEach(room => {
          socket.join(`room_${room.room_id}`);
        });
        
        console.log(`User ${socket.user.userId} joined ${rooms.length} chat rooms`);
      } catch (error) {
        console.error('Error joining rooms:', error);
      }
    });
    
    // Handle joining a specific room
    socket.on('join_room', async (roomId) => {
      try {
        // Verify user has access to this room
        const [access] = await db.execute(
          'SELECT 1 FROM chat_room_participants WHERE room_id = ? AND user_id = ?',
          [roomId, socket.user.userId]
        );
        
        if (access.length > 0) {
          socket.join(`room_${roomId}`);
          console.log(`User ${socket.user.userId} joined room ${roomId}`);
          
          // Notify other users in the room
          socket.to(`room_${roomId}`).emit('user_joined', {
            userId: socket.user.userId,
            firstName: socket.user.firstName,
            lastName: socket.user.lastName,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Error joining room:', error);
      }
    });
    
    // Handle leaving a room
    socket.on('leave_room', (roomId) => {
      socket.leave(`room_${roomId}`);
      console.log(`User ${socket.user.userId} left room ${roomId}`);
      
      // Notify other users in the room
      socket.to(`room_${roomId}`).emit('user_left', {
        userId: socket.user.userId,
        firstName: socket.user.firstName,
        lastName: socket.user.lastName,
        timestamp: new Date()
      });
    });
    
    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        console.log('Socket - send_message received:', data);
        console.log('Socket - user:', socket.user);
        
        const { roomId, message_text, message_type = 'text', reply_to_message_id } = data;
        
        // Verify user has access to this room
        const [access] = await db.execute(
          'SELECT 1 FROM chat_room_participants WHERE room_id = ? AND user_id = ?',
          [roomId, socket.user.userId]
        );
        
        console.log('Socket - Access check for user', socket.user.userId, 'in room', roomId, ':', access.length > 0 ? 'Granted' : 'Denied');
        
        if (access.length === 0) {
          socket.emit('error', { message: 'Access denied to this chat room' });
          return;
        }
        
        // Insert message into database
        console.log('Socket - Inserting message into database');
        const [result] = await db.execute(
          'INSERT INTO chat_messages (room_id, sender_id, message_text, message_type, reply_to_message_id) VALUES (?, ?, ?, ?, ?)',
          [roomId, socket.user.userId, message_text, message_type, reply_to_message_id || null]
        );
        console.log('Socket - Message inserted with ID:', result.insertId);
        
        // Get complete message data
        const [messageData] = await db.execute(`
          SELECT 
            m.message_id,
            m.message_text,
            m.message_type,
            m.created_at,
            m.reply_to_message_id,
            u.firstName,
            u.lastName,
            u.email,
            rm.message_text as reply_message_text,
            ru.firstName as reply_user_firstName,
            ru.lastName as reply_user_lastName
          FROM chat_messages m
          LEFT JOIN users u ON m.sender_id = u.userId
          LEFT JOIN chat_messages rm ON m.reply_to_message_id = rm.message_id
          LEFT JOIN users ru ON rm.sender_id = ru.userId
          WHERE m.message_id = ?
        `, [result.insertId]);
        
        // Broadcast message to all users in the room
        io.to(`room_${roomId}`).emit('new_message', {
          ...messageData[0],
          roomId: roomId
        });
        
        console.log(`Message sent in room ${roomId} by user ${socket.user.userId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { roomId } = data;
      socket.to(`room_${roomId}`).emit('user_typing', {
        userId: socket.user.userId,
        firstName: socket.user.firstName,
        lastName: socket.user.lastName,
        roomId: roomId
      });
    });
    
    socket.on('typing_stop', (data) => {
      const { roomId } = data;
      socket.to(`room_${roomId}`).emit('user_stopped_typing', {
        userId: socket.user.userId,
        roomId: roomId
      });
    });
    
    // Handle message reactions
    socket.on('add_reaction', async (data) => {
      try {
        const { messageId, reactionType } = data;
        
        // Add reaction to database
        await db.execute(
          'INSERT IGNORE INTO chat_message_reactions (message_id, user_id, reaction_type) VALUES (?, ?, ?)',
          [messageId, socket.user.userId, reactionType]
        );
        
        // Get room ID for this message
        const [messageInfo] = await db.execute(
          'SELECT room_id FROM chat_messages WHERE message_id = ?',
          [messageId]
        );
        
        if (messageInfo.length > 0) {
          const roomId = messageInfo[0].room_id;
          
          // Broadcast reaction to room
          io.to(`room_${roomId}`).emit('message_reaction', {
            messageId: messageId,
            userId: socket.user.userId,
            firstName: socket.user.firstName,
            lastName: socket.user.lastName,
            reactionType: reactionType,
            action: 'add'
          });
        }
      } catch (error) {
        console.error('Error adding reaction:', error);
      }
    });
    
    socket.on('remove_reaction', async (data) => {
      try {
        const { messageId, reactionType } = data;
        
        // Remove reaction from database
        await db.execute(
          'DELETE FROM chat_message_reactions WHERE message_id = ? AND user_id = ? AND reaction_type = ?',
          [messageId, socket.user.userId, reactionType]
        );
        
        // Get room ID for this message
        const [messageInfo] = await db.execute(
          'SELECT room_id FROM chat_messages WHERE message_id = ?',
          [messageId]
        );
        
        if (messageInfo.length > 0) {
          const roomId = messageInfo[0].room_id;
          
          // Broadcast reaction removal to room
          io.to(`room_${roomId}`).emit('message_reaction', {
            messageId: messageId,
            userId: socket.user.userId,
            reactionType: reactionType,
            action: 'remove'
          });
        }
      } catch (error) {
        console.error('Error removing reaction:', error);
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.firstName} ${socket.user.lastName} disconnected from chat`);
    });
    
    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
  
  console.log('Chat Socket.IO handlers initialized');
};

