<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h4>Service & Framework Utilized</h4>
    <table cellpadding="10px"  align="center">
      <tr>
        <td width="50%"><img src="static/images/s3.png"/><br/><a href="http://docs.aws.amazon.com/AmazonS3/latest/gsg/GetStartedWithS3.html">Amazon S3</a></td>
<td width="50"><img src="static/images/logo.png"/><br/><a href="https://vuejs.org/">Vue.js</a></td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  name: 'hello',
  data () {
    return {
      msg: 'Welcome to the AWS Serverless Workshop'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import '../assets/app.css';
</style>
