
pipeline {
	agent any

	environment {
		DOCKER_COMPOSE_PROJECT = 'family-recipes'
	}

	stages {
		stage('Remove') {
			steps {
				sh "docker compose -p $DOCKER_COMPOSE_PROJECT down -v"
			}
		}
	}
}
