import { getReceiverSocketId, io } from "../socket/socket.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";

export const register = async (req, res) => {
    try {
        const { username, email, mobile, password } = req.body;
        if (!username || !email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(401).json({
                message: "Try different email",
                success: false,
            });
        };
        if (mobile) {
            const existingMobile = await User.findOne({ mobile });
            if (existingMobile) {
                return res.status(401).json({
                    message: "This mobile number is already registered",
                    success: false,
                });
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = {
            username,
            email,
            password: hashedPassword
        };
        if (mobile) userData.mobile = mobile;
        await User.create(userData);
        return res.status(201).json({
            message: "Account created successfully.",
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error during registration",
            success: false,
        });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }

        // Detect if login credential is a mobile number or email
        const isMobile = /^\d{10}$/.test(email.trim());
        
        // Search by mobile or email
        let user;
        if (isMobile) {
            user = await User.findOne({ mobile: email.trim() });
        } else {
            user = await User.findOne({ email: email.trim() });
        }
        
        // If user doesn't exist - return specific message
        if (!user) {
            return res.status(404).json({
                message: isMobile ? "No account found with this mobile number" : "User not found with this email address",
                success: false,
            });
        }

        // User exists, now check password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        
        // If password is wrong - return specific message
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Email/mobile or password is incorrect",
                success: false,
            });
        }

        // Password is correct, proceed with login
        const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });

        // populate each post if in the posts array
        const populatedPosts = await Promise.all(
            user.posts.map(async (postId) => {
                const post = await Post.findById(postId);
                // Fix: null check for deleted posts
                if (post && post.author.equals(user._id)) {
                    return post;
                }
                return null;
            })
        )
        
        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            mobile: user.mobile,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: populatedPosts
        }
        
        return res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 1 * 24 * 60 * 60 * 1000 }).json({
            message: `Welcome back ${user.username}`,
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};

export const logout = async (_, res) => {
    try {
        return res.cookie("token", "", { maxAge: 0 }).json({
            message: 'Logged out successfully.',
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        let user = await User.findById(userId)
            .populate({ path: 'posts', options: { sort: { createdAt: -1 } } })
            .populate({ path: 'bookmarks', options: { sort: { createdAt: -1 } } })
            .populate({ path: 'followers', select: 'username profilePicture' })
            .populate({ path: 'following', select: 'username profilePicture' });
        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};

export const editProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { bio, gender } = req.body;
        const profilePicture = req.file;
        let cloudResponse;

        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
                success: false
            });
        };
        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (profilePicture) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            message: 'Profile updated.',
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};

export const getSuggestedUsers = async (req, res) => {
    try {
        const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password");
        if (!suggestedUsers) {
            return res.status(400).json({
                message: 'Currently do not have any users',
            })
        };
        return res.status(200).json({
            success: true,
            users: suggestedUsers
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};


export const followOrUnfollow = async (req, res) => {
    try {
        const followKrneWala = req.id;
        const jiskoFollowKrunga = req.params.id;

        if (followKrneWala === jiskoFollowKrunga) {
            return res.status(400).json({
                message: 'You cannot follow/unfollow yourself',
                success: false
            });
        }

        const user = await User.findById(followKrneWala);
        const targetUser = await User.findById(jiskoFollowKrunga);

        if (!user || !targetUser) {
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }

        const isFollowing = user.following.map(String).includes(String(jiskoFollowKrunga));

        if (isFollowing) {
            // unfollow
            await Promise.all([
                User.updateOne({ _id: followKrneWala }, { $pull: { following: jiskoFollowKrunga } }),
                User.updateOne({ _id: jiskoFollowKrunga }, { $pull: { followers: followKrneWala } }),
            ]);

            // Fetch updated users
            const updatedUser = await User.findById(followKrneWala).select('-password');
            const updatedTarget = await User.findById(jiskoFollowKrunga).select('-password');

            // Emit socket notification to target user (if online)
            const receiverSocketId = getReceiverSocketId(jiskoFollowKrunga);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('followChanged', {
                    from: followKrneWala,
                    action: 'unfollow'
                });
            }

            return res.status(200).json({
                message: 'Unfollowed successfully',
                success: true,
                user: updatedUser,
                targetUser: updatedTarget
            });
        } else {
            // follow
            await Promise.all([
                User.updateOne({ _id: followKrneWala }, { $push: { following: jiskoFollowKrunga } }),
                User.updateOne({ _id: jiskoFollowKrunga }, { $push: { followers: followKrneWala } }),
            ]);

            // Fetch updated users
            const updatedUser = await User.findById(followKrneWala).select('-password');
            const updatedTarget = await User.findById(jiskoFollowKrunga).select('-password');

            // Emit socket notification to target user (if online)
            const receiverSocketId = getReceiverSocketId(jiskoFollowKrunga);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('followChanged', {
                    from: followKrneWala,
                    action: 'follow'
                });
            }

            return res.status(200).json({
                message: 'Followed successfully',
                success: true,
                user: updatedUser,
                targetUser: updatedTarget
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
}

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(200).json({ users: [], success: true });
        }
        
        // Search by username (case-insensitive)
        const users = await User.find({
            username: { $regex: query, $options: 'i' }
        }).select('username profilePicture bio');
        
        return res.status(200).json({
            users,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};

export const updatePassword = async (req, res) => {
    try {
        const userId = req.id;
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current password and new password are required.", success: false });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found", success: false });

        const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Incorrect current password.", success: false });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: "Password updated successfully.", success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error during password update", success: false });
    }
};
