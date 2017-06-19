aws s3 mb --region us-east-1 s3://zzz-site-13345
aws s3 --region us-east-1 website s3://zzz-site-13345 --index-document index.html --error-document error.html

aws s3 mb  --region us-east-1 s3://zzz-data-13345
aws s3 --region us-east-1 website s3://zzz-data-13345 --index-document index.html --error-document error.html
