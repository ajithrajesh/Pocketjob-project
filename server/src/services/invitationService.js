import Invitation from "../models/Invitation.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import Application from "../models/Application.js";

export const sendInvitationService = async (companyId, jobId, seekerId) => {
  // 1. Verify job exists and belongs to this company
  const job = await Job.findById(jobId);
  if (!job) {
    throw new Error("Job listing not found");
  }
  if (job.company.toString() !== companyId.toString()) {
    throw new Error("You are not authorized to send invitations for this job");
  }

  // 2. Verify seeker exists and has role "user"
  const seeker = await User.findById(seekerId);
  if (!seeker || seeker.role !== "user") {
    throw new Error("Selected user is not a job seeker");
  }

  // 3. Check for existing invitation
  const existingInvitation = await Invitation.findOne({ job: jobId, seeker: seekerId });
  if (existingInvitation) {
    throw new Error("You have already invited this job seeker to this job");
  }

  // 4. Create invitation
  const invitation = await Invitation.create({
    job: jobId,
    seeker: seekerId,
    company: companyId,
    status: "pending",
  });

  return invitation;
};

export const getInvitationsService = async (userId, role) => {
  let query = {};
  let populateOptions = [];

  if (role === "company") {
    query.company = userId;
    populateOptions = [
      { path: "job" },
      { path: "seeker", select: "-password" }
    ];
  } else {
    query.seeker = userId;
    populateOptions = [
      { path: "job" },
      { path: "company", select: "fullName companyName email phone" }
    ];
  }

  const invitations = await Invitation.find(query)
    .populate(populateOptions)
    .sort({ createdAt: -1 });

  return invitations;
};

export const updateInvitationStatusService = async (invitationId, userId, status) => {
  if (!["accepted", "rejected"].includes(status)) {
    throw new Error("Invalid status. Must be accepted or rejected.");
  }

  const invitation = await Invitation.findById(invitationId).populate("job");
  if (!invitation) {
    throw new Error("Invitation not found");
  }

  // Check if current user is the seeker of the invitation
  if (invitation.seeker.toString() !== userId.toString()) {
    throw new Error("You are not authorized to update this invitation");
  }

  invitation.status = status;
  await invitation.save();

  // If accepted, automatically create an Application entry with status 'accepted'
  if (status === "accepted") {
    const existingApp = await Application.findOne({
      job: invitation.job._id,
      seeker: userId
    });

    if (!existingApp) {
      await Application.create({
        job: invitation.job._id,
        seeker: userId,
        status: "accepted",
      });
    } else {
      // If it exists, make sure the status is updated to accepted
      existingApp.status = "accepted";
      await existingApp.save();
    }
  }

  return invitation;
};
