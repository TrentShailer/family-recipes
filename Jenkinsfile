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
		ENV_FILE = credentials('family-recipes-env')
		DATABASE_ENV_FILE = credentials('family-recipes-database-env')
	}

	stages {
		stage ('Write env files') {
			steps {
				writeFile file: '.env', text: env.ENV_FILE
				writeFile file: 'database.env', text: env.DATABASE_ENV_FILE
			}
		}
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
				sh "docker build -t family-recipes:${getVersion()} ."
				sh "docker tag family-recipes:${getVersion()} portfolio:latest"
			}
		}
		stage('Deploy') {
			when {
				expression {
					currentBuild.result == null || currentBuild.result == 'SUCCESS'
				}
			}
			steps {
				echo 'Deploying...'
				sh 'docker compose -p family-recipes up -d'
			}
		}
	}
}
