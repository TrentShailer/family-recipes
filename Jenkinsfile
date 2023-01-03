node {
	env.NODEJS_HOME = "${tool 'NodeJS 18.12.1'}"
	env.PATH = "${env.NODEJS_HOME}/bin:${env.PATH}"
	sh 'node --version'
	sh 'npm --version'
	sh 'corepack enable'
	sh 'corepack prepare yarn@stable --activate'
	sh 'yarn --version'
}

def getVersion(){
	def packageJSON = readJSON file: 'package.json'
	def packageJSONVersion = packageJSON.version
	return packageJSONVersion
}

pipeline {
	agent any

	environment {
		DOCKER_CREDS = credentials('docker-creds')
		ENV_FILE = credentials('family-recipes-env')
		DOCKER_IMAGE = 'trentshailer/family-recipes'
		DOCKER_COMPOSE_PROJECT = 'family-recipes'
	}

	stages {
		stage ('Install Dependencies') {
			steps {
				sh 'yarn install'
			}
		}
		stage ('Test') {
			steps {
				sh 'yarn test'
			}
		}
		stage ('Build') {
			steps {
				sh 'yarn build'
			}
		}
		stage ('Docker Build') {
			steps {
				sh "docker login -u \"$DOCKER_CREDS_USR\" -p \"$DOCKER_CREDS_PSW\""
				sh "docker build -t $DOCKER_IMAGE:${getVersion()} ."
				sh "docker tag $DOCKER_IMAGE:${getVersion()} $DOCKER_IMAGE:latest"
			}
		}
		stage ('Docker Push') {
			steps {
				sh "docker push $DOCKER_IMAGE:${getVersion()}"
				sh "docker push $DOCKER_IMAGE:latest"
			}
		}
		stage('Deploy') {
			when {
				expression {
					currentBuild.result == null || currentBuild.result == 'SUCCESS'
				}
			}
			steps {
				sh "docker compose -p $DOCKER_COMPOSE_PROJECT --env-file \"$ENV_FILE\" up -d"
			}
		}
	}
}
