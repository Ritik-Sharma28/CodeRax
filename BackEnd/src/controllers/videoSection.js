import { v2 as cloudinary } from 'cloudinary';
import Problem from "../models/problem.js";
import { SolutionVideo } from "../models/solutionVideo.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const generateUploadSignature = async (req, res) => {
  try {
    const { problemId } = req.params;
    
    // Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Generate unique public_id for the video
    const timestamp = Math.round(new Date().getTime() / 1000);
    const publicId = `leetcode-solutions/${problemId}/${timestamp}`;
    
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
      eager: uploadParams.eager,
      eager_async: uploadParams.eager_async
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

    const bodyString = Buffer.isBuffer(req.body)
      ? req.body.toString('utf8')
      : typeof req.body === 'string'
        ? req.body
        : JSON.stringify(req.body);

    const isValid = cloudinary.utils.verifyNotificationSignature(
      bodyString,
      timestampHeader,
      signatureHeader,
      process.env.CLOUDINARY_API_SECRET
    );

    if (!isValid) {
      return res.status(401).send('Invalid webhook signature');
    }

    const payload = Buffer.isBuffer(req.body) || typeof req.body === 'string'
      ? JSON.parse(bodyString)
      : req.body;

    const { notification_type, public_id, secure_url, duration, eager } = payload;

    if (notification_type !== 'upload' && notification_type !== 'eager') {
      return res.status(200).send('Event ignored');
    }

    const parts = public_id.split('/');
    if (parts.length < 2 || parts[0] !== 'leetcode-solutions') {
      return res.status(200).send('Not a solution video');
    }

    const problemId = parts[1];
    // In admin upload, userId might not strictly apply as it's the admin, but schema requires it
    // We will use the creator of the problem or a default admin placeholder
    const problem = await Problem.findById(problemId);
    if(!problem) return res.status(404).json({error: "Problem not found"});
    const userId = problem.problemCreator;

    let thumbnailUrl = null;
    if (eager && eager.length > 0) {
      thumbnailUrl = eager[0].secure_url;
    } else {
      thumbnailUrl = cloudinary.url(public_id, {
        resource_type: 'video',
        transformation: [
          { width: 400, height: 225, crop: 'fill' },
          { format: 'jpg' }
        ]
      });
    }

    await SolutionVideo.findOneAndUpdate(
      { problemId },
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

// TEMPORARY FALLBACK FOR LOCALHOST TESTING
export const saveVideoLocalFallback = async (req, res) => {
  try {
    if (process.env.ENABLE_LOCAL_VIDEO_FALLBACK !== "true") {
      return res.status(403).json({ error: "Local video fallback is disabled" });
    }

    const { problemId, secureUrl, duration, publicId } = req.body;
    
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const thumbnailUrl = cloudinary.url(publicId, {
      resource_type: 'video',
      transformation: [
        { width: 400, height: 225, crop: 'fill' },
        { format: 'jpg' }
      ]
    });

    const video = await SolutionVideo.findOneAndUpdate(
      { problemId },
      {
        problemId,
        userId: problem.problemCreator,
        cloudinaryPublicId: publicId,
        secureUrl,
        duration: duration || 0,
        thumbnailUrl
      },
      { upsert: true, new: true }
    );

    res.json({ message: "Video saved locally via fallback", video });
  } catch (error) {
    console.error('Error saving local video:', error);
    res.status(500).json({ error: 'Failed' });
  }
};

export const getVideoForProblem = async (req, res) => {
  try {
    const { problemId } = req.params;
    const video = await SolutionVideo.findOne({ problemId });
    if (!video) {
      return res.status(404).json({ error: 'No editorial video found' });
    }
    res.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
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
