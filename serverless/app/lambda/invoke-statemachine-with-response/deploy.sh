#!/bin/bash

USER=$1
S3BUCKET=$2
if [  ${USER}x == 'x' ] 
then
  echo "Userid: required field please pass in your id as a parameter";
  exit;
fi
if [  ${S3BUCKET}x == 'x' ] 
then
  echo "S3BUCKET: required field please pass in your id as a parameter";
  exit;
fi
ENV=DEV

FILENAME=`npm pack`
echo "Moving ${FILENAME} to target";
mkdir -p target

#clean the target env
#rm -rf target/*;

mv ${FILENAME} target
BASE_FILE=`echo ${FILENAME} |sed s/.tgz//g`
echo ${BASE_FILE}
result=${PWD##*/}
cd target;
gunzip -c ${FILENAME} | tar xvf -

STACKNAME=${ENV}-${result}-${USER}
echo $STACKNAME

cp ../template/index.yaml package/;
cd package 
sed -i '' -e s/CodeUri:.*$/CodeUri:/g index.yaml
pwd
echo aws cloudformation package --template-file index.yaml --output-template-file S3-index.yaml --s3-bucket ${S3BUCKET}  

aws cloudformation package --template-file index.yaml --output-template-file S3-index.yaml --s3-bucket  ${S3BUCKET} 

echo aws cloudformation deploy --template-file S3-index.yaml --stack-name ${STACKNAME}

aws cloudformation deploy --template-file S3-index.yaml --stack-name ${STACKNAME}
cd ../../
#rm -rf target
