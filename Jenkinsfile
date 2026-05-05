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

        stage('Build & Tag Images') {
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

                            sh """
                            docker build \
                            -t ${DOCKERHUB_USER}/${service}:latest \
                            -t ${DOCKERHUB_USER}/${service}:${BUILD_NUMBER} \
                            .
                            """
                        }
                    }
                }
            }
        }

        stage('Login to DockerHub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: '2725',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Push Images') {
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
                        echo "Pushing ${service}..."

                        sh """
                        docker push ${DOCKERHUB_USER}/${service}:latest
                        docker push ${DOCKERHUB_USER}/${service}:${BUILD_NUMBER}
                        """
                    }
                }
            }
        }

        stage('Deploy (Docker Compose)') {
            steps {
                echo 'Deploying app...'

                sh '''
                docker compose pull
                docker compose down
                docker compose up -d
                '''
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline executed successfully 🚀'
        }
        failure {
            echo 'Pipeline failed ❌ check logs'
        }
    }
}