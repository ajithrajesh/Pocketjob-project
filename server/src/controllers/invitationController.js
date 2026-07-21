import {
  sendInvitationService,
  getInvitationsService,
  updateInvitationStatusService,
} from "../services/invitationService.js";

export const sendInvitation = async (req, res) => {
  try {
    const { jobId, seekerId } = req.body;
    if (!jobId || !seekerId) {
      return res.status(400).json({
        success: false,
        message: "Job ID and Seeker ID are required",
      });
    }

    const invitation = await sendInvitationService(req.user._id, jobId, seekerId);

    // Emit Socket notification to the seeker if connected
    const io = req.app.get("io");
    const userSockets = req.app.get("userSockets");
    if (io && userSockets) {
      const targetSocketId = userSockets.get(seekerId.toString());
      if (targetSocketId) {
        io.to(targetSocketId).emit("newInvitation", {
          message: `You received a new job invitation from ${req.user.companyName || req.user.fullName}!`,
          invitation,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "Invitation Sent Successfully",
      invitation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getInvitations = async (req, res) => {
  try {
    const invitations = await getInvitationsService(req.user._id, req.user.role);

    res.status(200).json({
      success: true,
      invitations,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateInvitationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const invitation = await updateInvitationStatusService(id, req.user._id, status);

    res.status(200).json({
      success: true,
      message: `Invitation ${status} successfully`,
      invitation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
