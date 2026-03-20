import { v2 as cloudinary } from 'cloudinary';
import Problem from "../models/problem.js";
import User from "../models/user.js";
import { SolutionVideo } from "../models/solutionVideo.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const generateUploadSignature = async (req, res) => {
  try {
    const { problemId } = req.params;
    
    const userId = req.result._id;
    // Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Generate unique public_id for the video
    const timestamp = Math.round(new Date().getTime() / 1000);
    const publicId = `leetcode-solutions/${problemId}/${userId}_${timestamp}`;
    
    // Upload parameters
    // Added eager transformation to automatically generate a video thumbnail
    const uploadParams = {
      timestamp: timestamp,
      public_id: publicId,
      eager: "c_fill,h_225,w_400,f_jpg",
      eager_async: true
    };

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      public_id: publicId,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
    });

  } catch (error) {
    console.error('Error generating upload signature:', error);
    res.status(500).json({ error: 'Failed to generate upload credentials' });
  }
};

export const handleCloudinaryWebhook = async (req, res) => {
  try {
    // 1. Verify the signature
    const signatureHeader = req.headers['x-cld-signature'];
    const timestampHeader = req.headers['x-cld-timestamp'];
    
    if (!signatureHeader || !timestampHeader) {
      return res.status(401).send('Missing signature headers');
    }

    // Convert req.body carefully to string format for verification
    const bodyString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    const isValid = cloudinary.utils.verifyNotificationSignature(
      bodyString,
      timestampHeader,
      signatureHeader,
      process.env.CLOUDINARY_API_SECRET
    );

    if (!isValid) {
      return res.status(401).send('Invalid webhook signature');
    }

    // 2. Process payload
    const { notification_type, public_id, secure_url, duration, eager } = req.body;

    // We only care about upload and eager (transformation) notifications
    if (notification_type !== 'upload' && notification_type !== 'eager') {
      return res.status(200).send('Event ignored');
    }

    // Extract problemId and userId from publicId
    // Format: leetcode-solutions/<problemId>/<userId>_<timestamp>
    const parts = public_id.split('/');
    if (parts.length < 3 || parts[0] !== 'leetcode-solutions') {
      return res.status(200).send('Not a solution video');
    }

    const problemId = parts[1];
    const userId = parts[2].split('_')[0];

    // Determine thumbnail url from eager transformations if available
    let thumbnailUrl = null;
    if (eager && eager.length > 0) {
      thumbnailUrl = eager[0].secure_url;
    } else {
      // Fallback thumbnail generation based on URL
      thumbnailUrl = cloudinary.url(public_id, {
        resource_type: 'video',
        transformation: [
          { width: 400, height: 225, crop: 'fill' },
          { format: 'jpg' }
        ]
      });
    }

    // UPSERT the video metadata to prevent duplicates
    await SolutionVideo.findOneAndUpdate(
      { problemId, userId },
      {
        problemId,
        userId,
        cloudinaryPublicId: public_id,
        secureUrl: secure_url,
        duration: duration || 0,
        thumbnailUrl
      },
      { upsert: true, new: true }
    );

    res.status(200).send('Webhook processed successfully');
  } catch (error) {
    console.error('Error processing Cloudinary webhook:', error);
    res.status(500).send('Webhook error');
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const { problemId } = req.params;

    const video = await SolutionVideo.findOneAndDelete({problemId:problemId});
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    await cloudinary.uploader.destroy(video.cloudinaryPublicId, { resource_type: 'video' , invalidate: true });

    res.json({ message: 'Video deleted successfully' });

  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
};