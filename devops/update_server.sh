#!/bin/bash

cd $HOME/workspace/GGR-Visual/ 
git checkout master 
git pull
git checkout production 
git merge master
cd $HOME
docker build -t ggrvisual/server workspace/GGR-Visual/
docker rm -f ggr_server_001
docker run --name ggr_server_001 -e ROOT_URL=http://localhost:8080 -e MONGO_URL=mongodb://meteor:uapAphKeZJ@67.159.92.72:27017/meteor -p 8080:80 -d ggrvisual/server
