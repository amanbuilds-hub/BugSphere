import Notification from '../models/Notification.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Get user's notifications
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = { 'recipients.userId': req.user._id };
    const notifications = await Notification.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('triggeredBy', 'name');

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
        'recipients.userId': req.user._id,
        'recipients.status': 'unread'
    });

    res.status(200).json({
        success: true,
        data: notifications,
        unreadCount,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
});

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { 'recipients.userId': req.user._id, 'recipients.status': 'unread' },
        { $set: { 'recipients.$.status': 'read' } }
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

/**
 * @desc    Mark specific notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, 'recipients.userId': req.user._id },
        { $set: { 'recipients.$.status': 'read' } },
        { new: true }
    );

    if (!notification) throw new ApiError(404, 'VAL_001', 'Notification not found');

    res.status(200).json({ success: true, data: notification });
});
