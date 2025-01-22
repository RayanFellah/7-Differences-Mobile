#!/bin/bash
# CONFIG
URL='ec2-3-145-174-66.us-east-2.compute.amazonaws.com'
#KEYFILE=/home/albus/sdcard/workspace/polydiff/polydiffkey.pem
#KEYFILE=/home/albus/storage/workspace/polydiff/polydiffkey.pem
KEYFILE=./polydiffkey.pem
USERNAME='ec2-user'

LOGINCOMMAND="ssh -i $KEYFILE $USERNAME@$URL"

login() {
    $LOGINCOMMAND
}

watch() {
    $LOGINCOMMAND << EOF
    tail -f ~/polydiff.log
EOF
}

deploy() {
    $LOGINCOMMAND << EOF
    sudo pkill -f node
    cd ~/LOG3900-209
    git fetch origin
    git reset --hard origin/main
    cd server
    npm ci
    npm run build
    setsid node out/server/app/index.js > ~/polydiff.log 2>&1 &
EOF
}

restart() {
    $LOGINCOMMAND << EOF
    sudo pkill -f node
    cd ~/LOG3900-209/server
    npm run build
    setsid node out/server/app/index.js > ~/polydiff.log 2>&1 &
EOF
}

while true; do
    echo "Choose an option:"
    echo "1) Deploy"
    echo "2) Restart"
    echo "3) Watch"
    echo "4) Login"
    echo "5) Exit"
    read -p "Enter your choice: " choice
    case $choice in
        1) deploy;;
        2) restart;;
        3) watch;;
        4) login;;
        5) exit;;
        *) echo "Invalid choice";;
    esac
done

