import { asyncHandler } from "../utils/asyncHandler.js";
import { Project } from "../models/Project/project.model.js";
import { User } from "../models/User/user.model.js";
import { projectCreationUtility } from "../utils/projectCreation.js";
import { Explore } from "../models/Explore/explore.model.js";
import OpenAI from "openai";

const getMyProjects = asyncHandler(async (req, res) => {
  // const userId = req.user._id;
  const { user } = req;
  const projects = await Project.find({ creator: user._id });
  if (!projects.length) {
    return res.status(404).send({ message: "No Projects", success: false });
  }
  res
    .status(200)
    .send({ message: "Projects Fetched", success: true, projects });
});

const createProject = asyncHandler(async (req, res) => {
  const { name, location } = req.body;
  const { imageUrl } = req;
  if (!name || !location) {
    return res
      .status(400)
      .send({ message: "All fields are required", success: false });
  }
  const newProject = {
    name,
    location,
    displayImage: imageUrl,
    creator: req.user._id.toString(),
  };

  const projectId = await projectCreationUtility(newProject);
  const user = await User.findById(req.user._id);
  user.projects.push(projectId);
  await user.save();

  res.status(200).send({
    message: "Project Created Successfully",
    success: true,
    project: newProject,
  });
});

const generateImage = asyncHandler(async (req,res)=>{
  const {prompt} = req.body;
  const openai = new OpenAI({apiKey: process.env.OPENAI_API});

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1024x1792",
  });
  const imageUrl =response.data[0].url;
  return res.status(200).send({message: "Ok", success:true, imageUrl});
  
});


const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params; // Extract projectId from request parameters
  const userId = req.user._id; // Get the authenticated user's ID

  const project = await Project.findById(projectId); // Find the project

  if (!project) {
    return res
      .status(404)
      .json({ message: "Project not found", success: false });
  }

  if (project.creator.toString() !== userId.toString()) {
    return res.status(403).json({ message: "Unauthorized", success: false });
  }

  await Project.findByIdAndDelete(projectId); // Delete the project
  res
    .status(200)
    .json({ message: "Project Deleted Successfully", success: true });
});

const publishProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { user } = req;
  const project = await Project.findById(id);
  if(!project.description || !project.contact){
    return res.status(400).send({ message: "Project not ready for publishing yet ", success: false });
  }
  project.published = true;
  await project.save();
  const explore = await Explore.create({
    project: id,
    user: user._id,
  });
  await explore.save();
  return res.status(200).send({ message: "Project Published", success: true });
});

const unPublishProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const { user } = req;
  const project = await Project.findById(id);
  project.published = false;
  await project.save();
  await Explore.findOneAndDelete({project:id, user:user._id});
  return res.status(200).send({ message: "Project UnPublished", success: true });
});

const getProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const project = await Project.findById(id);
  return res
    .status(200)
    .send({ message: "Project fetched", succes: true, project });
});
export { getMyProjects, createProject, deleteProject, publishProject,unPublishProject,getProject, generateImage };
