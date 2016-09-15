docker run -p 27017:27017  --name mongo_instance_001 -v /nfs/gcb_reddy_ggr/:/data/db -d ggrvisual/mongodb:0.5.0 /usr/bin/mongod --auth
docker run -e ROOT_URL=http://localhost:8080 -e MONGO_URL=mongodb://meteor:uapAphKeZJ@67.159.92.72:27017/meteor -p 8080:80 -d ggrvisual/server
