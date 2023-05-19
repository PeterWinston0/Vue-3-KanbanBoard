<template>
  <div>
    <h2>Project List</h2>
    <ul>
      <li v-for="project in projects" :key="project._id">
        <router-link :to="`/${project._id}`">{{ project.title }}</router-link>
        <button @click="deleteProject(project._id)">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      projects: [],
    };
  },
  mounted() {
    this.fetchProjects();
  },
  methods: {
    fetchProjects() {
      fetch("http://localhost:3000/api/project")
        .then((response) => response.json())
        .then((data) => {
          this.projects = data;
        })
        .catch((error) => {
          console.error("Error fetching projects:", error);
        });
    },
    deleteProject(projectId) {
      fetch(`http://localhost:3000/api/project/${projectId}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            console.log("Project deleted successfully!");
            this.projects = this.projects.filter((project) => project._id !== projectId);
          } else {
            console.error("Failed to delete project.");
          }
        })
        .catch((error) => {
          console.error("Error deleting project:", error);
        });
    },
  },
};
</script>


<!-- <template>
  <div>
    <h2>Project List</h2>
    <ul>
      <li v-for="project in projects" :key="project._id">
        <router-link :to="`/${project._id}`">{{ project.title }}</router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      projects: [],
    };
  },
  mounted() {
    this.fetchProjects();
  },
  methods: {
    async fetchProjects() {
      try {
        const response = await fetch("http://localhost:3000/api/project");
        const data = await response.json();
        this.projects = data;
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    },
  },
};
</script> -->


<!-- <template>
    <div>
      <h2>All Projects</h2>
      <ul>
        <li v-for="project in projects" :key="project.id">
          <h3>{{ project.title }}</h3>
          <p>{{ project.description }}</p>
          <router-link :to="`/detail/${project.id}`">View Details</router-link>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        projects: []
      };
    },
    mounted() {
      this.fetchProjects();
    },
    methods: {
      async fetchProjects() {
        try {
          const response = await fetch('http://localhost:3000/api/project');
          const data = await response.json();
          this.projects = data;
        } catch (error) {
          console.error('Error fetching projects:', error);
        }
      }
    }
  };
  </script> -->
  