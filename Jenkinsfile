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
                        'frontend',
                        'api-gateway'
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

                withCredentials([
                    usernamePassword(
                        credentialsId: '2725',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {

                    sh '''
                    echo "$DOCKER_PASS" | docker login \
                    -u "$DOCKER_USER" \
                    --password-stdin
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
                        'frontend',
                        'api-gateway'
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

        // stage('Deploy (Docker Compose)') {
        //     steps {

        //         echo 'Deploying app...'

        //         withCredentials([

        //             file(credentialsId: 'auth-env', variable: 'AUTH_ENV'),
        //             file(credentialsId: 'payment-env', variable: 'PAYMENT_ENV'),
        //             file(credentialsId: 'cart-env', variable: 'CART_ENV'),
        //             file(credentialsId: 'notification-env', variable: 'NOTIFICATION_ENV'),
        //             file(credentialsId: 'order-env', variable: 'ORDER_ENV'),
        //             file(credentialsId: 'product-env', variable: 'PRODUCT_ENV')

        //         ]) {

        //             sh '''
        //             cp $AUTH_ENV auth-service/.env.prod
        //             cp $PAYMENT_ENV payment-service/.env.prod
        //             cp $CART_ENV cart-service/.env.prod
        //             cp $NOTIFICATION_ENV notification-service/.env.prod
        //             cp $ORDER_ENV order-service/.env.prod
        //             cp $PRODUCT_ENV products-service/.env.prod

        //             docker compose down
        //             docker compose pull
        //             docker compose up -d
        //             '''
        //         }
        //     }
        // }

        stage('Deploy to Kubernetes') {

            steps {

                withCredentials([
                    file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')
                ]) {

                    script {

                        def services = [
                            'auth-service',
                            'notification-service',
                            'product-service',
                            'cart-service',
                            'order-service',
                            'payment-service',
                            'frontend',
                            'gateway'
                        ]

                        for (service in services) {

                            echo "Deploying ${service}..."

                            sh """
                            kubectl set image deployment/${service}-deployment \
                            ${service}=${DOCKERHUB_USER}/${service}:${BUILD_NUMBER}

                            kubectl rollout status deployment/${service}-deployment
                            """
                        }
                    }
                }
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