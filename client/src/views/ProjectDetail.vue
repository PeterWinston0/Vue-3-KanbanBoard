<template>
  <div>
    <h2 v-if="!editableTitle" @click="editableTitle = true">{{ title }}</h2>
    <input v-else type="text" v-model="title" @blur="editableTitle = false" />

    <div class="kanban-board">
      <div class="column" v-for="column in columns" :key="column.id">
        <h3>{{ column.title }}</h3>
        <div :id="`column-${column.id}`" class="task-list" ref="taskLists">
          <div v-for="task in column.tasks" :key="task.id" class="task">
            <div v-if="!task.editableTitle">
              <span @click="task.editableTitle = true">{{ task.title }}</span>
            </div>
            <div v-else>
              <input
                type="text"
                v-model="task.editableTaskTitle"
                :disabled="!task.editableTitle"
                @input="
                  updateTaskTitle(column.id, task.id, task.editableTaskTitle)
                "
                @blur="task.editableTitle = false"
              />
            </div>
            <div v-if="!task.editableDescription">
              <span @click="task.editableDescription = true">{{ task.description }}</span>
            </div>
            <div v-else>
              <textarea
                v-model="task.editableTaskDescription"
                :disabled="!task.editableDescription"
                @input="
                  updateTaskDescription(
                    column.id,
                    task.id,
                    task.editableTaskDescription
                  )
                "
                @blur="task.editableDescription = false"
              ></textarea>
            </div>
            <button
              v-if="column.id > 1"
              @click="moveTask(task.id, column.id - 1)"
            >
              ←
            </button>
            <button
              v-if="column.id < columns.length"
              @click="moveTask(task.id, column.id + 1)"
            >
              →
            </button>
            <button @click="deleteTask(column.id, task.id)">Delete</button>
          </div>
        </div>
      </div>
    </div>
    <button @click="addTask">Add Task</button>
    <button @click="saveKanbanBoard">Save</button>
    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from "vue";
import Sortable from "sortablejs";

export default {
  data() {
    return {
      project: null,
      title: "",
      editableTitle: false,
      columns: [
        { id: 1, title: "To Do", tasks: [] },
        { id: 2, title: "In Progress", tasks: [] },
        { id: 3, title: "Done", tasks: [] },
      ],
      successMessage: "",
    };
  },
  mounted() {
    this.fetchProject();
  },
  methods: {
    async fetchProject() {
      try {
        const projectId = this.$route.params.id;
        const response = await fetch(
          `http://localhost:3000/api/project/${projectId}`
        );
        const data = await response.json();
        this.project = data;
        this.title = this.project.title;
        this.mapTasksToColumns();
        this.initializeSortable();
      } catch (error) {
        console.error("Error fetching project:", error);
      }
    },
    mapTasksToColumns() {
      if (this.project && this.project.tasks) {
        this.columns.forEach((column) => {
          const tasks = this.project.tasks[column.title.toLowerCase()] || [];
          column.tasks = tasks.map((task) => ({
            id: task._id,
            title: task.title,
            description: task.description,
            editableTitle: false,
            editableTaskTitle: task.title,
            editableDescription: false,
            editableTaskDescription: task.description,
          }));
        });
      }
    },
    initializeSortable() {
      nextTick(() => {
        const taskLists = Array.from(this.$refs.taskLists);

        taskLists.forEach((taskList) => {
          const sortable = Sortable.create(taskList, {
            group: "kanban-board",
            onEnd: (evt) => {
              const movedTask = this.columns
                .find((column) => column.id === +evt.from.id.split("-")[1])
                .tasks.splice(evt.oldIndex, 1)[0];
              const targetColumn = this.columns.find(
                (column) => column.id === +evt.to.id.split("-")[1]
              );
              targetColumn.tasks.splice(evt.newIndex, 0, movedTask);
            },
          });
          sortable.option("onMove", (evt) => {
            return evt.related.className.indexOf("task") > -1;
          });
        });
      });
    },
    addTask() {
      const newTaskId =
        Math.max(...this.columns.map((column) => column.tasks.length)) + 1;
      const newTask = {
        id: newTaskId,
        title: `Task ${newTaskId}`,
        description: `Description ${newTaskId}`,
        editableTitle: false,
        editableTaskTitle: "",
        editableDescription: false,
        editableTaskDescription: "",
      };
      this.columns[0].tasks.push(newTask);
    },
    deleteTask(columnId, taskId) {
      const column = this.columns.find((column) => column.id === columnId);
      const taskIndex = column.tasks.findIndex((task) => task.id === taskId);
      column.tasks.splice(taskIndex, 1);
    },
    updateTaskTitle(columnId, taskId, newTitle) {
      const column = this.columns.find((column) => column.id === columnId);
      const task = column.tasks.find((task) => task.id === taskId);
      task.title = newTitle;
    },
    updateTaskDescription(columnId, taskId, newDescription) {
      const column = this.columns.find((column) => column.id === columnId);
      const task = column.tasks.find((task) => task.id === taskId);
      task.description = newDescription;
    },
    saveKanbanBoard() {
      // Get the project ID
      const projectId = this.$route.params.id;

      // Create a new object to store the updated tasks
      const updatedTasks = {};

      // Map the tasks to their respective columns
      this.columns.forEach((column) => {
        updatedTasks[column.title.toLowerCase()] = column.tasks.map((task) => ({
          _id: task.id,
          title: task.title,
          description: task.description,
        }));
      });

      // Create the request payload
      const payload = {
        tasks: updatedTasks,
      };

      // Send the request to update the project
      fetch(`http://localhost:3000/api/project/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (response.ok) {
            console.log("Kanban board saved successfully");
            this.successMessage = "Kanban board saved successfully";
          } else {
            throw new Error("Failed to save kanban board");
          }
        })
        .catch((error) => {
          console.error("Error saving kanban board:", error);
        });
    },
    moveTask(taskId, targetColumnId) {
      const sourceColumnIndex = this.columns.findIndex((column) =>
        column.tasks.some((task) => task.id === taskId)
      );
      const targetColumnIndex = this.columns.findIndex(
        (column) => column.id === targetColumnId
      );
      const taskIndex = this.columns[sourceColumnIndex].tasks.findIndex(
        (task) => task.id === taskId
      );
      const movedTask = this.columns[sourceColumnIndex].tasks.splice(
        taskIndex,
        1
      )[0];
      this.columns[targetColumnIndex].tasks.push(movedTask);
    },
  },
};
</script>

<style scoped>
.kanban-board {
  display: flex;
}

.column {
  flex: 1;
  margin: 0 10px;
}

.task-list {
  min-height: 200px;
  background-color: #f5f5f5;
  padding: 10px;
  margin-bottom: 20px;
}

.task {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
}

.task textarea {
  width: 100%;
}

.success-message {
  color: green;
  margin-top: 10px;
}
</style>



<!-- <template>
  <div>
    <h2 v-if="!editableTitle" @click="editableTitle = true">{{ title }}</h2>
    <input v-else type="text" v-model="title" @blur="editableTitle = false" />

    <div class="kanban-board">
      <div class="column" v-for="column in columns" :key="column.id">
        <h3>{{ column.title }}</h3>
        <div :id="`column-${column.id}`" class="task-list" ref="taskLists">
          <div v-for="task in column.tasks" :key="task.id" class="task">
            <div v-if="!task.editableTitle">
              <span @click="task.editableTitle = true">{{ task.title }}</span>
            </div>
            <div v-else>
              <input
                type="text"
                v-model="task.editableTaskTitle"
                :disabled="!task.editableTitle"
                @input="
                  updateTaskTitle(column.id, task.id, task.editableTaskTitle)
                "
                @blur="task.editableTitle = false"
              />
            </div>
            <div v-if="!task.editableDescription">
              <span @click="task.editableDescription = true">{{ task.description }}</span>
            </div>
            <div v-else>
              <textarea
                v-model="task.editableTaskDescription"
                :disabled="!task.editableDescription"
                @input="
                  updateTaskDescription(
                    column.id,
                    task.id,
                    task.editableTaskDescription
                  )
                "
                @blur="task.editableDescription = false"
              ></textarea>
            </div>
            <button
              v-if="column.id > 1"
              @click="moveTask(task.id, column.id - 1)"
            >
              ←
            </button>
            <button
              v-if="column.id < columns.length"
              @click="moveTask(task.id, column.id + 1)"
            >
              →
            </button>
            <button @click="deleteTask(column.id, task.id)">Delete</button>
          </div>
        </div>
      </div>
    </div>
    <button @click="addTask">Add Task</button>
    <button @click="saveKanbanBoard">Save</button>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from "vue";
import Sortable from "sortablejs";

export default {
  data() {
    return {
      project: null,
      title: "",
      editableTitle: false,
      columns: [
        { id: 1, title: "To Do", tasks: [] },
        { id: 2, title: "In Progress", tasks: [] },
        { id: 3, title: "Done", tasks: [] },
      ],
    };
  },
  mounted() {
    this.fetchProject();
  },
  methods: {
    async fetchProject() {
      try {
        const projectId = this.$route.params.id;
        const response = await fetch(
          `http://localhost:3000/api/project/${projectId}`
        );
        const data = await response.json();
        this.project = data;
        this.title = this.project.title;
        this.mapTasksToColumns();
        this.initializeSortable();
      } catch (error) {
        console.error("Error fetching project:", error);
      }
    },
    mapTasksToColumns() {
      if (this.project && this.project.tasks) {
        this.columns.forEach((column) => {
          const tasks = this.project.tasks[column.title.toLowerCase()] || [];
          column.tasks = tasks.map((task) => ({
            id: task._id,
            title: task.title,
            description: task.description,
            editableTitle: false,
            editableTaskTitle: task.title,
            editableDescription: false,
            editableTaskDescription: task.description,
          }));
        });
      }
    },
    initializeSortable() {
      nextTick(() => {
        const taskLists = Array.from(this.$refs.taskLists);

        taskLists.forEach((taskList) => {
          const sortable = Sortable.create(taskList, {
            group: "kanban-board",
            onEnd: (evt) => {
              const movedTask = this.columns
                .find((column) => column.id === +evt.from.id.split("-")[1])
                .tasks.splice(evt.oldIndex, 1)[0];
              const targetColumn = this.columns.find(
                (column) => column.id === +evt.to.id.split("-")[1]
              );
              targetColumn.tasks.splice(evt.newIndex, 0, movedTask);
            },
          });
          sortable.option("onMove", (evt) => {
            return evt.related.className.indexOf("task") > -1;
          });
        });
      });
    },
    addTask() {
      const newTaskId =
        Math.max(...this.columns.map((column) => column.tasks.length)) + 1;
      const newTask = {
        id: newTaskId,
        title: `Task ${newTaskId}`,
        description: `Description ${newTaskId}`,
        editableTitle: false,
        editableTaskTitle: "",
        editableDescription: false,
        editableTaskDescription: "",
      };
      this.columns[0].tasks.push(newTask);
    },
    deleteTask(columnId, taskId) {
      const column = this.columns.find((column) => column.id === columnId);
      const taskIndex = column.tasks.findIndex((task) => task.id === taskId);
      column.tasks.splice(taskIndex, 1);
    },
    updateTaskTitle(columnId, taskId, newTitle) {
      const column = this.columns.find((column) => column.id === columnId);
      const task = column.tasks.find((task) => task.id === taskId);
      task.title = newTitle;
    },
    updateTaskDescription(columnId, taskId, newDescription) {
      const column = this.columns.find((column) => column.id === columnId);
      const task = column.tasks.find((task) => task.id === taskId);
      task.description = newDescription;
    },
    saveKanbanBoard() {
      // Get the project ID
      const projectId = this.$route.params.id;

      // Create a new object to store the updated tasks
      const updatedTasks = {};

      // Map the tasks to their respective columns
      this.columns.forEach((column) => {
        updatedTasks[column.title.toLowerCase()] = column.tasks.map((task) => ({
          _id: task.id,
          title: task.title,
          description: task.description,
        }));
      });

      // Create the request payload
      const payload = {
        tasks: updatedTasks,
      };

      // Send the request to update the project
      fetch(`http://localhost:3000/api/project/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (response.ok) {
            console.log("Kanban board saved successfully!");
            // You can add any additional logic here after the save operation
          } else {
            console.error("Failed to save the Kanban board.");
          }
        })
        .catch((error) => {
          console.error("Error saving the Kanban board:", error);
        });
    },
  },
};
</script> -->



<!-- <template>
  <div>
    <h2 v-if="!editableTitle" @click="editableTitle = true">{{ title }}</h2>
    <input v-else type="text" v-model="title" @blur="saveTaskTitle" />

    <div class="kanban-board">
      <div class="column" v-for="column in columns" :key="column.id">
        <h3>{{ column.title }}</h3>
        <div :id="`column-${column.id}`" class="task-list" ref="taskLists">
          <div v-for="task in column.tasks" :key="task.id" class="task">
            <div v-if="!task.editableTitle">
              <span @click="startEditTaskTitle(task)">{{ task.title }}</span>
            </div>
            <div v-else>
              <input
                type="text"
                v-model="task.editableTaskTitle"
                @blur="saveTaskTitle"
              />
              <button @click="cancelEditTaskTitle(task)">Cancel</button>
            </div>
            <div v-if="!task.editableDescription">
              <span @click="startEditTaskDescription(task)">{{ task.description }}</span>
            </div>
            <div v-else>
              <textarea
                v-model="task.editableTaskDescription"
                @blur="saveTaskDescription"
              ></textarea>
              <button @click="cancelEditTaskDescription(task)">Cancel</button>
            </div>
            <button v-if="column.id > 1" @click="moveTask(task.id, column.id - 1)">←</button>
            <button v-if="column.id < columns.length" @click="moveTask(task.id, column.id + 1)">→</button>
            <button @click="deleteTask(column.id, task.id)">Delete</button>
          </div>
        </div>
      </div>
    </div>
    <button @click="addTask">Add Task</button>
    <button @click="saveKanbanBoard">Save</button>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from "vue";
import Sortable from "sortablejs";

export default {
  data() {
    return {
      project: null,
      title: "",
      editableTitle: false,
      columns: [
        { id: 1, title: "To Do", tasks: [] },
        { id: 2, title: "In Progress", tasks: [] },
        { id: 3, title: "Done", tasks: [] },
      ],
    };
  },
  mounted() {
    this.fetchProject();
  },
  methods: {
    async fetchProject() {
      try {
        const projectId = this.$route.params.id;
        const response = await fetch(`http://localhost:3000/api/project/${projectId}`);
        const data = await response.json();
        this.project = data;
        this.title = this.project.title;
        this.mapTasksToColumns();
        this.initializeSortable();
      } catch (error) {
        console.error("Error fetching project:", error);
      }
    },
    mapTasksToColumns() {
      if (this.project && this.project.tasks) {
        this.columns.forEach((column) => {
          const tasks = this.project.tasks[column.title.toLowerCase()] || [];
          column.tasks = tasks.map((task) => ({
            id: task._id,
            title: task.title,
            description: task.description,
            editableTitle: false,
            editableTaskTitle: "",
            editableDescription: false,
            editableTaskDescription: "",
          }));
        });
      }
    },
    initializeSortable() {
      nextTick(() => {
        const taskLists = Array.from(this.$refs.taskLists);

        taskLists.forEach((taskList) => {
          const sortable = Sortable.create(taskList, {
            group: "kanban-board",
            onEnd: (evt) => {
              const movedTask = this.columns
                .find((column) => column.id === +evt.from.id.split("-")[1])
                .tasks.splice(evt.oldIndex, 1)[0];
              const targetColumn = this.columns.find(
                (column) => column.id === +evt.to.id.split("-")[1]
              );
              targetColumn.tasks.splice(evt.newIndex, 0, movedTask);
            },
          });
          sortable.option("onMove", (evt) => {
            return evt.related.className.indexOf("task") > -1;
          });
        });
      });
    },
    addTask() {
      const newTaskId = Math.max(...this.columns.map((column) => column.tasks.length)) + 1;
      const newTask = {
        id: newTaskId,
        title: `Task ${newTaskId}`,
        description: `Description ${newTaskId}`,
        editableTitle: false,
        editableTaskTitle: "",
        editableDescription: false,
        editableTaskDescription: "",
      };
      this.columns[0].tasks.push(newTask);
    },
    deleteTask(columnId, taskId) {
      const column = this.columns.find((column) => column.id === columnId);
      const taskIndex = column.tasks.findIndex((task) => task.id === taskId);
      column.tasks.splice(taskIndex, 1);
    },
    startEditTaskTitle(task) {
      task.editableTitle = true;
      task.editableTaskTitle = task.title;
    },
    saveTaskTitle() {
      this.columns.forEach((column) => {
        column.tasks.forEach((task) => {
          if (task.editableTitle) {
            task.title = task.editableTaskTitle;
            task.editableTitle = false;
          }
        });
      });
    },
    cancelEditTaskTitle(task) {
      task.editableTitle = false;
      task.editableTaskTitle = task.title;
    },
    startEditTaskDescription(task) {
      task.editableDescription = true;
      task.editableTaskDescription = task.description;
    },
    saveTaskDescription() {
      this.columns.forEach((column) => {
        column.tasks.forEach((task) => {
          if (task.editableDescription) {
            task.description = task.editableTaskDescription;
            task.editableDescription = false;
          }
        });
      });
    },
    cancelEditTaskDescription(task) {
      task.editableDescription = false;
      task.editableTaskDescription = task.description;
    },
    moveTask(taskId, targetColumnId) {
      const sourceColumn = this.columns.find((column) =>
        column.tasks.some((task) => task.id === taskId)
      );
      const targetColumn = this.columns.find((column) => column.id === targetColumnId);
      const taskIndex = sourceColumn.tasks.findIndex((task) => task.id === taskId);
      const movedTask = sourceColumn.tasks.splice(taskIndex, 1)[0];
      targetColumn.tasks.push(movedTask);
    },
  },
};
</script> -->





<!-- <script>
import { ref, onMounted, nextTick } from "vue";
import Sortable from "sortablejs";

export default {
  data() {
    return {
      project: null,
      title: "",
      editableTitle: false,
      columns: [
        { id: 1, title: "To Do", tasks: [] },
        { id: 2, title: "In Progress", tasks: [] },
        { id: 3, title: "Done", tasks: [] }
      ]
    };
  },
  mounted() {
    this.fetchProject();
  },
  methods: {
    async fetchProject() {
      try {
        const projectId = this.$route.params.id;
        const response = await fetch(`http://localhost:3000/api/project/${projectId}`);
        const data = await response.json();
        this.project = data;
        this.title = this.project.title;
        this.mapTasksToColumns();
        this.initializeSortable();
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    },
    mapTasksToColumns() {
      this.columns.forEach(column => {
        const tasks = this.project.tasks[column.title.toLowerCase()];
        column.tasks = tasks ? tasks.map(task => ({
          id: task._id,
          title: task.title,
          description: task.description,
          editableTitle: false,
          editableTaskTitle: "",
          editableDescription: false,
          editableTaskDescription: ""
        })) : [];
      });
    },
    initializeSortable() {
      nextTick(() => {
        const taskLists = Array.from(this.$refs.taskLists);
  
        taskLists.forEach(taskList => {
          const sortable = Sortable.create(taskList, {
            group: "kanban-board",
            onEnd: evt => {
              const movedTask = this.columns
                .find(column => column.id === +evt.from.id.split("-")[1])
                .tasks.splice(evt.oldIndex, 1)[0];
              const targetColumn = this.columns.find(column => column.id === +evt.to.id.split("-")[1]);
              targetColumn.tasks.splice(evt.newIndex, 0, movedTask);
            }
          });
          sortable.option("onMove", evt => {
            return evt.related.className.indexOf("task") > -1;
          });
        });
      });
    },
    addTask() {
      const newTaskId = Math.max(...this.columns.map(column => column.tasks.length)) + 1;
      const newTask = {
        id: newTaskId,
        title: `Task ${newTaskId}`,
        description: `Description ${newTaskId}`,
        editableTitle: false,
        editableTaskTitle: "",
        editableDescription: false,
        editableTaskDescription: ""
      };
      this.columns[0].tasks.push(newTask);
    },
    deleteTask(columnId, taskId) {
      const column = this.columns.find(column => column.id === columnId);
      if (column) {
        const taskIndex = column.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          column.tasks.splice(taskIndex, 1);
        }
      }
    },
    moveTask(taskId, targetColumnId) {
      const targetColumn = this.columns.find(column => column.id === targetColumnId);
      const sourceColumn = this.columns.find(column =>
        column.tasks.some(task => task.id === taskId)
      );
      if (sourceColumn && targetColumn) {
        const taskIndex = sourceColumn.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          const task = sourceColumn.tasks.splice(taskIndex, 1)[0];
          targetColumn.tasks.push(task);
        }
      }
    },
    updateTaskTitle(columnId, taskId, newTitle) {
      const column = this.columns.find(column => column.id === columnId);
      if (column) {
        const task = column.tasks.find(task => task.id === taskId);
        if (task) {
          task.title = newTitle;
        }
      }
    },
    updateTaskDescription(columnId, taskId, newDescription) {
      const column = this.columns.find(column => column.id === columnId);
      if (column) {
        const task = column.tasks.find(task => task.id === taskId);
        if (task) {
          task.description = newDescription;
        }
      }
    },
    saveKanbanBoard() {
      const requestBody = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columns: this.columns }),
      };

      fetch('http://localhost:3000/api/kanbanboards/save', requestBody)
        .then(response => response.json())
        .then(data => {
          console.log(data.message);
          // Handle success
        })
        .catch(error => {
          console.error('Error saving Kanban board:', error);
          // Handle error
        });
    },
  },
};
</script> -->

<style scoped>
.kanban-board {
  display: flex;
  flex-wrap: wrap;
}

.column {
  flex: 1;
  padding: 16px;
  background-color: #f5f5f5;
  width: calc(50% - 32px); /* Adjust the width as needed */
  margin: 0 16px 16px 0;
}

.task-list {
  min-height: 100px;
  background-color: #fff;
  margin-bottom: 16px;
}

.task {
  border: 1px solid #ccc;
  padding: 8px;
  margin-bottom: 8px;
  cursor: grab;
}

/* Responsive Styling */
@media screen and (max-width: 767px) {
  .column {
    width: 100%; /* Change to full width on small screens */
    margin-right: 0;
  }
}
</style>

<!-- <template>
  <div>
    <h2>{{ project ? project.title : 'Loading...' }}</h2>
    <p>{{ project ? project.description : 'Loading...' }}</p>

    <div class="kanban-board" v-if="project && project.tasks">
      <div class="column" ref="todoColumn">
        <h3>To Do</h3>
        <ul class="task-list" ref="todoList">
          <li v-for="task in project.tasks.todo" :key="task.id" class="task">{{ task.title }}</li>
        </ul>
      </div>

      <div class="column" ref="inProgressColumn">
        <h3>In Progress</h3>
        <ul class="task-list" ref="inProgressList">
          <li v-for="task in project.tasks.inProgress" :key="task.id" class="task">{{ task.title }}</li>
        </ul>
      </div>

      <div class="column" ref="doneColumn">
        <h3>Done</h3>
        <ul class="task-list" ref="doneList">
          <li v-for="task in project.tasks.done" :key="task.id" class="task">{{ task.title }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import Sortable from 'sortablejs';

export default {
  data() {
    return {
      project: null
    };
  },
  mounted() {
    this.fetchProject();
  },
  methods: {
    async fetchProject() {
      try {
        const projectId = this.$route.params.id;
        const response = await fetch(`http://localhost:3000/api/project/${projectId}`);
        const data = await response.json();
        this.project = data;

        this.initializeSortable();
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    },
    initializeSortable() {
      const todoListElement = this.$refs.todoList;
      if (todoListElement) {
        new Sortable(todoListElement, {
          group: 'kanban',
          onEnd: this.updateTasks.bind(this)
        });
      }

      const inProgressListElement = this.$refs.inProgressList;
      if (inProgressListElement) {
        new Sortable(inProgressListElement, {
          group: 'kanban',
          onEnd: this.updateTasks.bind(this)
        });
      }

      const doneListElement = this.$refs.doneList;
      if (doneListElement) {
        new Sortable(doneListElement, {
          group: 'kanban',
          onEnd: this.updateTasks.bind(this)
        });
      }
    },
    updateTasks() {
      // Handle the logic to update the project's tasks on the server
      // For simplicity, this example doesn't include the backend integration
      console.log('Tasks updated:', this.project.tasks);
    }
  }
};
</script>

<style>
.kanban-board {
  display: flex;
}

.column {
  flex: 1;
  margin: 0 1rem;
}

.task-list {
  min-height: 200px;
  background-color: #f5f5f5;
  padding: 0.5rem;
}

.task {
  background-color: #ffffff;
  border: 1px solid #cccccc;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
}
</style> -->
