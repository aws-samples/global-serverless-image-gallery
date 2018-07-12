#!/usr/bin/env bash

SRC_BKT_ARR=();
STACK_DTLS=();
APP_BKT_ARR=();

checkNgEnv() {

    if hash npm 2>/dev/null; then
      echo "npm available"
    else
      echo "install npm"
      exit 1;
    fi  
    
    if [ ! -d "$NPM_DIR" ]; then
        npm install
    fi
    cd ..

    echo "Checking wheather Angular cli(ng) is installed"
    if hash ng 2>/dev/null; then
        echo "ng is installed"
    else
        echo "Installing Angular cli"
        npm install -g @angular/cli &
    fi
    cd -
}

createResource() {
    for i in "${REGIONS[@]}"
    do
        echo "Deploying stack in "$i;
        SRC_BUK_NAME="src"$(date +%s)$RANDOM
        SRC_BKT_ARR+=($SRC_BUK_NAME)
        aws s3 mb s3://$SRC_BUK_NAME --region $i
        aws s3 cp ./lambda s3://$SRC_BUK_NAME/ --recursive --region $i 
        aws cloudformation deploy --region $i --template ./serverlessImageGallery.yaml --stack-name $ROOT_NAME --capabilities CAPABILITY_IAM --parameter-overrides BucketName=$SRC_BUK_NAME FacebookId=$FACEBOOK_ID > /tmp/output.txt &
    done
    wait;
}

buildCopyWebApp() {
    cd $ROOT_DIR
    pwd
    for i in 0 1
    do
        apiURL=$(getAPIUrl "${STACK_DTLS[$i]}");
        identityPoolId=$(getIDPoolId "${STACK_DTLS[$i]}");
        writeConfigFiles "${REGIONS[$i]}" "$apiURL" "$identityPoolId";
        ng build --prod --aot
        createAppS3Bucket $i ${REGIONS[$i]}
        aws s3 cp $ROOT_DIR/dist/ s3://"${APP_BKT_ARR[$i]}"/ --recursive 
    done
 }

enableCRR() {
    
  CRR_ROLE=();
  GALLERY_BKT=();
  for i in 0 1
      do
          CRR_ROLE+=($(getCRRRole "${STACK_DTLS[$i]}"));
          GALLERY_BKT+=($(getGalleryBktName "${STACK_DTLS[$i]}"));
      done
  
  aws s3api put-bucket-replication --bucket ${GALLERY_BKT[0]} --replication-configuration "{
        \"Role\": \"${CRR_ROLE[0]}\",
        \"Rules\": [
          {
            \"Prefix\": \"\",
            \"Status\": \"Enabled\",
            \"Destination\": {
              \"Bucket\": \"arn:aws:s3:::${GALLERY_BKT[1]}\"
            }
          }
        ]
      }";    
  aws s3api put-bucket-replication --bucket ${GALLERY_BKT[1]} --replication-configuration "{
        \"Role\": \"${CRR_ROLE[1]}\",
        \"Rules\": [
          {
            \"Prefix\": \"\",
            \"Status\": \"Enabled\",
            \"Destination\": {
              \"Bucket\": \"arn:aws:s3:::${GALLERY_BKT[0]}\"
            }
          }
        ]
      }";
}

createGlobalDDB() {
    TABLE_NAME="_ImgMetadata";
    aws dynamodb create-global-table \
        --global-table-name $ROOT_NAME$TABLE_NAME \
        --replication-group RegionName=${REGIONS[0]} RegionName=${REGIONS[1]} \
        --region ${REGIONS[0]}
}       

getStackOutput() {
     for i in "${REGIONS[@]}"
        do
            STACK_DTLS+=("$(aws cloudformation describe-stacks --region $i --stack-name  $ROOT_NAME --output text --query 'Stacks[0].Outputs[*].[OutputKey, OutputValue]')")
     done
}

getCRRRole(){
    value=$(sed -n 's/.*S3ReplAccessRoleId \([^ ]*\).*/\1/p' <<< $1)
    echo $value
}

getGalleryBktName(){
    value=$(sed -n 's/.*GalleryS3Bucket \([^ ]*\).*/\1/p' <<< $1)
    echo $value
}

getAPIUrl(){
    value=$(sed -n 's/.*ApiUrl \([^ ]*\).*/\1/p' <<< $1)
    echo $value
}

getIDPoolId(){
    value=$(sed -n 's/.*CognitoIdentityPoolId \([^ ]*\).*/\1/p' <<< $1)
    echo $value
}

createAppS3Bucket(){
  
  local bucket_name;
  if [ $1 == 0 ]; then
    bucket_name="$DOMAIN_NAME-pri"
  else   
    bucket_name="$DOMAIN_NAME"    
  fi
 
  aws s3 mb s3://$bucket_name --region $2
  aws s3 website s3://$bucket_name/ --index-document index.html 
  aws s3api put-bucket-policy --bucket $bucket_name --policy "{
      \"Version\": \"2012-10-17\",
      \"Statement\": [
      {
          \"Sid\": \"PublicReadGetObject\",
          \"Effect\": \"Allow\",
          \"Principal\": \"*\",
          \"Action\": \"s3:GetObject\",
          \"Resource\": \"arn:aws:s3:::$bucket_name/*\"
      }]
    }"
  APP_BKT_ARR+=($bucket_name)
}

createDNS() {
  cd $CURR_DIR
  region1AppURL="${APP_BKT_ARR[0]}.s3-website.${REGIONS[0]}.amazonaws.com"
  region2AppURL="${APP_BKT_ARR[1]}.s3-website.${REGIONS[1]}.amazonaws.com"
  aws cloudformation deploy --region ${REGIONS[1]} --template ./serverlessCloudFrontAndRoute53.yaml --stack-name "DNS-$ROOT_NAME" --capabilities CAPABILITY_IAM --parameter-overrides DomainName=$DOMAIN_NAME Region1AppURL=$region1AppURL Region2AppURL=$region2AppURL HostedZoneId=$HOSTED_ZONE_ID > /tmp/output.txt &
  wait;
}

deleteSrcBucket() {
    for i in "${SRC_BKT_ARR[@]}"
    do
      echo "deleting bucket : "$i
      aws s3 rb s3://$i --force
    done
 }

printConfig() {
    echo " ****************************************************** "
    for i in 0 1
    do
      echo "Resource references for region ${REGIONS[$i]} are : "
      echo "  "
      echo " Web End Point : "
      echo "http://${APP_BKT_ARR[$i]}.s3-website.${REGIONS[$i]}.amazonaws.com"
      echo "  "
      echo "${STACK_DTLS[$i]}"
      echo " ****************************************************** "
    done
}

writeConfigFiles() {
(
cat <<EOF

export const environment = {
  production: false,
  region: '$1',
  apiUrl: '$2',
  identityPoolId: '$3',
  fbId:'$FACEBOOK_ID'
};

EOF
) > $ROOT_DIR/src/environments/environment.ts

(
cat <<EOF
export const environment = {
  production: true,
  region: '$1',
  apiUrl: '$2',
  identityPoolId: '$3',
  fbId:'$FACEBOOK_ID'
};

EOF
) > $ROOT_DIR/src/environments/environment.prod.ts

}

  echo -n "Enter a name for your cloud formation stack (must be all lowercase with no spaces) and press [ENTER]: "
  read ROOT_NAME

  if [[ $ROOT_NAME =~ [[:upper:]]|[[:space:]] || -z "$ROOT_NAME" ]]; then
      echo "Invalid format"
      exit 1
  fi

  echo -n "Enter your Facebook App ID : "
  read FACEBOOK_ID

  if [[ $FACEBOOK_ID == "" ]]; then
    echo "Enter Facebook id"
    exit 1
  fi

  echo -n "Enter your domain name : "
  read DOMAIN_NAME

  if [[ $DOMAIN_NAME == "" ]]; then
    echo "Enter domain name of your web application"
    exit 1
  fi

  echo -n "Enter 2 regions seperated by space eg: us-east-1 us-east-2 "
  read -a REGIONS
   
  if [ ${#REGIONS[@]} -ne 2 ] 
      then
          echo "Enter exactly 2 regions for deployment"  
          exit 1  
      fi 

  echo -n "Enter your HostedZoneId  : "
  read HOSTED_ZONE_ID

  if [[ $HOSTED_ZONE_ID == "" ]]; then
    echo "Enter domain name of your web application"
    exit 1
  fi

  CURR_DIR=$( cd $(dirname $0) ; pwd -P )
  ROOT_DIR=$( cd $CURR_DIR; cd ..; pwd -P)

  NPM_DIR=$ROOT_DIR/node_modules/

  checkNgEnv
  createResource
  getStackOutput
  buildCopyWebApp
  enableCRR
  createGlobalDDB
  deleteSrcBucket
  createDNS
  printConfig
 

