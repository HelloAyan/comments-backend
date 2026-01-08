import Comment from "../models/Comment.js";

// Create comment
export const addComment = async (req, res) => {
    const { text } = req.body;
    if (!text) {
        res.status(400);
        throw new Error("Comment text is required");
    }
    const comment = await Comment.create({ text, user: req.user._id });
    res.status(201).json(comment);
};

// Get comments with pagination and sorting
export const getComments = async (req, res) => {
    const { page = 1, limit = 10, sort = "newest" } = req.query;

    let sortOption;
    if (sort === "mostLiked") sortOption = { "likes.length": -1, createdAt: -1 };
    else if (sort === "mostDisliked") sortOption = { "dislikes.length": -1, createdAt: -1 };
    else sortOption = { createdAt: -1 };

    const comments = await Comment.find()
        .populate("user", "name email")
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const total = await Comment.countDocuments();

    res.json({ total, page: parseInt(page), comments });
};

// Update comment
export const updateComment = async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;
    const comment = await Comment.findById(id);
    if (!comment) {
        res.status(404);
        throw new Error("Comment not found");
    }
    if (comment.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("Not authorized to edit this comment");
    }
    comment.text = text || comment.text;
    const updatedComment = await comment.save();
    res.json(updatedComment);
};

// Delete comment
export const deleteComment = async (req, res) => {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) {
        res.status(404);
        throw new Error("Comment not found");
    }
    if (comment.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error("Not authorized to delete this comment");
    }
    await comment.remove();
    res.json({ message: "Comment deleted" });
};

// Like comment
export const likeComment = async (req, res) => {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) {
        res.status(404);
        throw new Error("Comment not found");
    }
    if (comment.likes.includes(req.user._id)) {
        res.status(400);
        throw new Error("You have already liked this comment");
    }
    comment.likes.push(req.user._id);
    comment.dislikes = comment.dislikes.filter(
        (userId) => userId.toString() !== req.user._id.toString()
    );
    await comment.save();
    res.json(comment);
};

// Dislike comment
export const dislikeComment = async (req, res) => {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) {
        res.status(404);
        throw new Error("Comment not found");
    }
    if (comment.dislikes.includes(req.user._id)) {
        res.status(400);
        throw new Error("You have already disliked this comment");
    }
    comment.dislikes.push(req.user._id);
    comment.likes = comment.likes.filter(
        (userId) => userId.toString() !== req.user._id.toString()
    );
    await comment.save();
    res.json(comment);
};
