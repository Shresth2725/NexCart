pipeline {
    agent any

    environment {
        DOCKERHUB_USER = 'shresth2725'
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Services') {
            steps {
                script {
                    def services = [
                        'auth-service',
                        'notification-service',
                        'products-service',
                        'cart-service',
                        'order-service',
                        'payment-service',
                        'frontend'
                    ]

                    for (service in services) {
                        dir(service) {
                            echo "Building ${service}..."

                            // sh 'npm install'

                            sh """
                            docker build \
                            -t ${DOCKERHUB_USER}/${service}:latest \
                            -t ${DOCKERHUB_USER}/${service}:${BUILD_NUMBER} .
                            """
                        }
                    }
                }
            }
        }

        stage('Login & Push Images') {
            steps {
                script {
                    def services = [
                        'auth-service',
                        'notification-service',
                        'products-service',
                        'cart-service',
                        'order-service',
                        'payment-service',
                        'frontend'
                    ]

                    withCredentials([usernamePassword(
                        credentialsId: '2725',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {

                        sh "echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin"

                        for (service in services) {
                            echo "Pushing ${service}..."

                            sh """
                            docker push ${DOCKERHUB_USER}/${service}:latest
                            docker push ${DOCKERHUB_USER}/${service}:${BUILD_NUMBER}
                            """
                        }
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying app...'
                sh 'docker-compose down'
                sh 'docker-compose up -d'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Done successfully!'
        }
        failure {
            echo 'Something failed, check logs.'
        }
    }
}