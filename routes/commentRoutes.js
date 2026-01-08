import express from "express";
import {
    addComment,
    getComments,
    updateComment,
    deleteComment,
    likeComment,
    dislikeComment,
} from "../controllers/commentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getComments);
router.post("/", protect, addComment);
router.put("/:id", protect, updateComment);
router.delete("/:id", protect, deleteComment);
router.post("/:id/like", protect, likeComment);
router.post("/:id/dislike", protect, dislikeComment);

export default router;
