import { BlogArticle } from "@/types/blog";

export const validateBlogPost = (post: BlogArticle): void => {
    // 1. Expert Insight Validation
    if (!post.expert_insight || typeof post.expert_insight !== 'string') {
        throw new Error("Expert Insight is required.");
    }

    const expertInsightWordCount = post.expert_insight.trim().split(/\s+/).length;
    if (expertInsightWordCount < 60 || expertInsightWordCount > 90) {
        throw new Error(`Expert Insight must be between 60 and 90 words. Currently: ${expertInsightWordCount} words.`);
    }

    // 2. Decision Snapshot Validation
    if (!post.decision_snapshot) {
        throw new Error("Decision Snapshot block is required.");
    }

    const { bestSuitedIf, lessSuitableIf, commonMistake } = post.decision_snapshot;

    if (!Array.isArray(bestSuitedIf) || bestSuitedIf.length < 2) {
        throw new Error("Decision Snapshot requires at least 2 'Best suited if' points.");
    }

    if (!Array.isArray(lessSuitableIf) || lessSuitableIf.length < 1) {
        throw new Error("Decision Snapshot requires at least 1 'Less suitable if' point.");
    }

    if (!commonMistake || typeof commonMistake !== 'string' || commonMistake.trim().length === 0) {
        throw new Error("Decision Snapshot requires a 'Common mistake to avoid' explanation.");
    }
};
