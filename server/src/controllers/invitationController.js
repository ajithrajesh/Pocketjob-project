import {
  sendInvitationService,
  getInvitationsService,
  updateInvitationStatusService,
} from "../services/invitationService.js";
import { createAndSendNotification } from "../services/notificationService.js";

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

    // Trigger Notification DB record, Socket event & Preset Email to candidate
    createAndSendNotification({
      recipientId: seekerId,
      senderId: req.user._id,
      type: "job_invitation",
      title: "New Job Invitation Received 📩",
      message: `${req.user.companyName || req.user.fullName} has invited you for a job opportunity!`,
      link: "/dashboard?tab=invitations",
      data: { invitationId: invitation._id, jobId },
      app: req.app,
    });

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

    // Send notification & preset email to the company/employer
    if (invitation && invitation.company) {
      const isAccepted = status === "accepted";
      const title = isAccepted ? "Job Invitation Accepted! 🎉" : "Job Invitation Update";
      const message = `${req.user.fullName} has ${status.toUpperCase()} your job invitation for "${invitation.job?.title || 'your job listing'}".`;

      createAndSendNotification({
        recipientId: invitation.company,
        senderId: req.user._id,
        type: isAccepted ? "invitation_accepted" : "invitation_rejected",
        title,
        message,
        link: "/dashboard?tab=invitations",
        data: { invitationId: invitation._id },
        app: req.app,
      });
    }

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
