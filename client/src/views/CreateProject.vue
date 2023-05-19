<template>
    <div>
      <h2>Create Project</h2>
      <form @submit.prevent="createProject">
        <div>
          <label for="title">Title:</label>
          <input type="text" id="title" v-model="newProject.title" required />
        </div>
        <div>
          <label for="description">Description:</label>
          <textarea id="description" v-model="newProject.description" required></textarea>
        </div>
        <button type="submit">Create</button>
      </form>
  
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        newProject: {
          title: '',
          description: ''
        },
        successMessage: ''
      };
    },
    methods: {
      async createProject() {
        try {
          const response = await fetch('http://localhost:3000/api/project', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.newProject)
          });
          if (response.ok) {
            // Project created successfully
            this.successMessage = 'Project created successfully!';
            this.clearForm();
          } else {
            console.error('Failed to create project');
          }
        } catch (error) {
          console.error('Error creating project:', error);
        }
      },
      clearForm() {
        this.newProject.title = '';
        this.newProject.description = '';
      }
    }
  };
  </script>
  
  <style>
  .success-message {
    color: green;
  }
  </style>
  