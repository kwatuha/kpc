-- Script to add missing financial years from 2013/2014 to current year
-- Financial years run from July 1 to June 30 of the following year
-- All financial years are stored with "FY" prefix for uniformity (e.g., "FY2014/2015")
-- The system accepts flexible input formats: FY2014/2015, fy2014/2015, 2014/2015, 2014-2015, fy 2014-2015

-- Insert financial years from 2013/2014 to 2025/2026 with FY prefix
-- Using INSERT IGNORE to skip duplicates based on finYearName

INSERT IGNORE INTO financialyears (finYearName, startDate, endDate, remarks, voided, userId) VALUES
('FY2013/2014', '2013-07-01 00:00:00', '2014-06-30 23:59:59', 'Financial year 2013/2014', 0, 1),
('FY2014/2015', '2014-07-01 00:00:00', '2015-06-30 23:59:59', 'Financial year 2014/2015', 0, 1),
('FY2015/2016', '2015-07-01 00:00:00', '2016-06-30 23:59:59', 'Financial year 2015/2016', 0, 1),
('FY2016/2017', '2016-07-01 00:00:00', '2017-06-30 23:59:59', 'Financial year 2016/2017', 0, 1),
('FY2017/2018', '2017-07-01 00:00:00', '2018-06-30 23:59:59', 'Financial year 2017/2018', 0, 1),
('FY2018/2019', '2018-07-01 00:00:00', '2019-06-30 23:59:59', 'Financial year 2018/2019', 0, 1),
('FY2019/2020', '2019-07-01 00:00:00', '2020-06-30 23:59:59', 'Financial year 2019/2020', 0, 1),
('FY2020/2021', '2020-07-01 00:00:00', '2021-06-30 23:59:59', 'Financial year 2020/2021', 0, 1),
('FY2021/2022', '2021-07-01 00:00:00', '2022-06-30 23:59:59', 'Financial year 2021/2022', 0, 1),
('FY2022/2023', '2022-07-01 00:00:00', '2023-06-30 23:59:59', 'Financial year 2022/2023', 0, 1),
('FY2023/2024', '2023-07-01 00:00:00', '2024-06-30 23:59:59', 'Financial year 2023/2024', 0, 1),
('FY2024/2025', '2024-07-01 00:00:00', '2025-06-30 23:59:59', 'Financial year 2024/2025', 0, 1),
('FY2025/2026', '2025-07-01 00:00:00', '2026-06-30 23:59:59', 'Financial year 2025/2026', 0, 1);

