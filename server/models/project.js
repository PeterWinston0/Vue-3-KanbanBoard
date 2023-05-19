const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  tasks: {
    type: Object,
    required: true,
    default: {
      todo: [],
      doing: [],
      done: [],
    },
  },
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;

// const mongoose = require('mongoose');

// const taskSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true
//   },
//   description: {
//     type: String,
//     required: true
//   }
// });

// const columnSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true
//   },
//   tasks: [taskSchema]
// });

// const projectSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true
//   },
//   description: {
//     type: String,
//     required: true
//   },
//   columns: [columnSchema]
// });

// const Project = mongoose.model('Project', projectSchema);

// module.exports = Project;


// const mongoose = require('mongoose');

// const projectSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true
//   },
//   description: {
//     type: String,
//     required: true
//   },
//   tasks: [
//     {
//       title: {
//         type: String,
//         required: true
//       },
//       description: {
//         type: String,
//         required: true
//       },
//       status: {
//         type: String,
//         enum: ['todo', 'in-progress', 'done'],
//         default: 'todo'
//       }
//     }
//   ]
// });

// const Project = mongoose.model('Project', projectSchema);

// module.exports = Project;


// const mongoose = require('mongoose');

// const Schema = mongoose.Schema;

// const taskSchema = new Schema(
//   {
//     title: {
//       type: String,
//       required: true
//     },
//     description: {
//       type: String,
//     },
//   },
//   {
//     timestamps: true
//   }
// );

// const columnSchema = new Schema(
//   {
//     title: {
//       type: String,
//       required: true
//     },
//     tasks: [taskSchema]
//   },
//   {
//     timestamps: true
//   }
// );

// const projectSchema = new Schema(
//   {
//     title: {
//       type: String,
//       required: true
//     },
//     columns: [columnSchema]
//   },
//   {
//     timestamps: true
//   }
// );

// const Project = mongoose.model('Project', projectSchema);

// module.exports = { Project };




// const mongoose = require("mongoose");

// const Schema = mongoose.Schema;

// // Define the task schema
// const taskSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true,
//   },
//   description: {
//     type: String,
//     required: true,
//   },
//   columnId: {
//     type: Number,
//     required: true,
//   },
// });

// // Define the column schema
// const columnSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true,
//   },
//   tasks: [taskSchema],
// });

// const projectSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true,
//   },
//   description: {
//     type: String,
//   },
//   stakeholders: {
//     type: String,
//   },
//   allocated_hours: {
//     type: Number,
//   },
//   dropbox_url: {
//     type: String,
//   },
//   github_url: {
//     type: String,
//   },
//   project_id: {
//     type: Number,
//   },
//   columns: [columnSchema],
// });

// module.exports = mongoose.model("project", projectSchema);

// // models.js

// const mongoose = require('mongoose');

// // Define the task schema
// const taskSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true
//   },
//   description: {
//     type: String,
//     required: true
//   },
//   columnId: {
//     type: Number,
//     required: true
//   }
// });

// // Define the column schema
// const columnSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true
//   },
//   tasks: [taskSchema]
// });

// // Define the project schema
// const projectSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true
//   },
//   columns: [columnSchema]
// });

// // Create the models
// const Task = mongoose.model('Task', taskSchema);
// const Column = mongoose.model('Column', columnSchema);
// const Project = mongoose.model('Project', projectSchema);

// // Export the models
// module.exports = {
//   Task,
//   Column,
//   Project
// };

//         //start_date: {
//         //    type: Date,
//         //    default: Date.now
//         //},

// let projectSchema = new Schema({
//   title: {
//     type: String,
//     required: true,
//   },
//   description: {
//     type: String,
//   },
//   stakeholders: {
//     type: String,
//   },
//   allocated_hours: {
//     type: Number,
//   },
//   dropbox_url: {
//     type: String,
//   },
//   github_url: {
//     type: String,
//   },
//   project_id: {
//     type: Number,
//   },
// });