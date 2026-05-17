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

        stage('Secret Scan - Gitleaks') {
            steps {

                echo 'Scanning for secrets...'

                sh '''
                gitleaks detect . \
                --verbose \
                --redact \
                --exit-code 0
                '''
            }
        }

        stage('SonarQube Analysis') {
            steps {

                script {

                    def scannerHome = tool 'sonar-scanner'

                    withSonarQubeEnv('sonarqube') {

                        sh """
                        ${scannerHome}/bin/sonar-scanner
                        """
                    }
                }
            }
        }

        stage('Vulnerability Scan - Trivy') {
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

                            echo "Scanning ${service}..."

                            sh """
                            trivy image \
                            --format table \
                            --severity CRITICAL \
                            --exit-code 1 \
                            ${DOCKERHUB_USER}/${service}:latest
                            """
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

        // stage('Deploy to Kubernetes') {
        //     steps {

        //         withCredentials([
        //             file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')
        //         ]) {

        //             script {
        //                 def deployments = [
        //                     [k8sName: 'auth-service',         imageName: 'auth-service'],
        //                     [k8sName: 'notification-service', imageName: 'notification-service'],
        //                     [k8sName: 'product-service',      imageName: 'products-service'],
        //                     [k8sName: 'cart-service',          imageName: 'cart-service'],
        //                     [k8sName: 'order-service',         imageName: 'order-service'],
        //                     [k8sName: 'payment-service',       imageName: 'payment-service'],
        //                     [k8sName: 'frontend',              imageName: 'frontend'],
        //                     [k8sName: 'gateway',               imageName: 'api-gateway']
        //                 ]

        //                 for (dep in deployments) {

        //                     echo "Deploying ${dep.k8sName}..."

        //                     sh """
        //                     kubectl set image deployment/${dep.k8sName}-deployment \
        //                     ${dep.k8sName}=${DOCKERHUB_USER}/${dep.imageName}:${BUILD_NUMBER} \
        //                     -n nexcart

        //                     kubectl rollout status deployment/${dep.k8sName}-deployment \
        //                     -n nexcart
        //                     """
        //                 }
        //             }
        //         }
        //     }
        // }

        stage('Update Kubernetes Manifests') {
            steps {

                script {

                    def deployments = [
                        [path: 'kubernetes/auth-service/deployment.yml',         image: 'auth-service'],
                        [path: 'kubernetes/notification-service/deployment.yml', image: 'notification-service'],
                        [path: 'kubernetes/product-service/deployment.yml',      image: 'products-service'],
                        [path: 'kubernetes/cart-service/deployment.yml',         image: 'cart-service'],
                        [path: 'kubernetes/order-service/deployment.yml',        image: 'order-service'],
                        [path: 'kubernetes/payment-service/deployment.yml',      image: 'payment-service'],
                        [path: 'kubernetes/frontend/deployment.yml',             image: 'frontend'],
                        [path: 'kubernetes/gateway/deployment.yml',              image: 'api-gateway']
                    ]

                    for (dep in deployments) {

                        echo "Updating ${dep.image} manifest..."

                        sh """
                        sed -i 's|image: .*|image: ${DOCKERHUB_USER}/${dep.image}:${BUILD_NUMBER}|g' ${dep.path}
                        """
                    }
                }
            }
        }

        stage('Push Updated Manifests') {

            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: 'github-creds',
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_PASS'
                    )
                ]) {

                    sh '''
                    git config user.email "jenkins@nexcart.com"
                    git config user.name "jenkins"

                    git add .

                    git commit -m "Updated image tags to build ${BUILD_NUMBER}" || true

                    git push https://${GIT_PASS}@github.com/Shresth2725/NexCart.git HEAD:main
                    '''
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