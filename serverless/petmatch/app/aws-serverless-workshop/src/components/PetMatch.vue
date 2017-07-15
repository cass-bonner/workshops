<template>
  <div class="PetMatch">
    <table>
      <tr>
        <td>
          <h1>Welcome to PetMatch</h1>
          Answer a few basic questions and we'll match the pet for you!
          <table>
            <tr>
              <td align="left">
                <br/>
                {{ questions.question1.question }}
                <select width="3px" required v-model="questions.question1.duress">
                  <option disabled value="">Please select yes or no</option>
                  <option selected>yes</option>
                  <option>no</option>
                </select>
                <br/>
              </td>
            </tr>
            <tr>
              <td align="left">
                <br/>
                {{ questions.question2.question }}
                <select required v-model="questions.question2.walks">
                  <option style="color:black" disabled value="">Please select yes or no</option>
                  <option selected style="color:gray">yes</option>
                  <option>no</option>
                </select>
                <br/>
              </td>
            </tr>
            <tr>
              <td align="left">
                <br/>
                {{ questions.question3.question }}
                <select required v-model="questions.question3.sass">
                  <option style="color:black" disabled value="">Please select yes or no</option>
                  <option selected style="color:gray">yes</option>
                  <option>no</option>
                </select>
                <br/>
              </td>
            </tr>
            <tr>
              <td align="left">
                <br/>
                {{ questions.question4.question }}
                <select required v-model="questions.question4.travel">
                  <option style="color:black" disabled value="">Please select the approximate days</option>
                  <option selected style="color:gray">0</option>
                  <option style="color:gray">5</option>
                  <option>10</option>
                  <option>15</option>
                </select>
                <br/>
              </td>
            </tr>
            <tr>
              <td align="left">
                <br/>
                {{ questions.question5.question }}
                <select required v-model="questions.question5.yap">
                  <option style="color:black" disabled value="">Please select yes or no</option>
                  <option style="color:gray">yes</option>
                  <option selected>no</option>
                </select>
                <br/>
              </td>
            </tr>
            <tr>
              <td align="left">
                <br/>
                {{ questions.question6.question }}
                <select required v-model="questions.question6.accommodation">
                  <option style="color:black" disabled value="">Please select accommodation type</option>
                  <option selected style="color:gray">house</option>
                  <option>apartment</option>
                  <option>townhouse</option>
                </select>
                <br/>
              </td>
            </tr>
            <tr>
              <td align="left">
                <br/>
                {{ questions.question7.question }}
                <select required v-model="questions.question7.outside">
                  <option style="color:black" disabled value="">Please select approximate outdoors area</option>
                  <option style="color:gray">0</option>
                  <option>5</option>
                  <option selected>10</option>
                  <option>15</option>
                  <option>20</option>
                </select>
                <br/>
                <br/>
                <button type="submit" class="btn btn-default" v-on:click="submit">submit</button>
                <br/>
                <br/>
                </ul>
              </td>
            </tr>
          </table>
        </td>
        <td>
          <span style="display:none" id="hidden_div">
          Your Match Results:
          <br/>
          <br/>
          Breed: {{ questions.matchResults.breed }}<br/>
          Classification:  {{ questions.matchResults.Classification }}<br/>
          Lifespan: {{ questions.matchResults.lifespan }}<br/></br>
          <img v-bind:src="questions.matchResults.image" /><br/>
          <font size="1">All images courtesy of icanhascheesburger or Wikipedia</font>
          </span>
        </td>
      </tr>
    </table>
  </div>
</template>
<script>
  /* eslint-disable space-infix-ops, quotes, no-undef,no-unused-vars, no-redeclare   */
  import ApiG from 'aws-api-gateway-client'
  var CONFIG = require('./config.json')
  var bot = require('./bot-loader.js')
  export default {
    name: 'PetMatch',
    data () {
      return {
        questions: {
          question1: {
            duress: 'no',
            question: 'Do you feel that you are under stress? '
          },
          question2: {
            walks: 'yes',
            question: 'Do you enjoy going for walks outside and in the park? '
          },
          question3: {
            sass: 'yes',
            question: 'Do you like to be around people that have an interesting, yet sassy character?'
          },
          question4: {
            travel: 5,
            question: 'How many days per month do you travel?'
          },
          question5: {
            yap: 'no',
            question: 'Do you mind consistent yapping?'
          },
          question6: {
            accommodation: 'apartment',
            question: 'Do you live in an apartment or house?'
          },
          question7: {
            outside: 20,
            question: 'If you have an Outdoors area, how large is it in sq m? Say 0 if you do not have one.'
          },
          matchResults: {
            Classification: '',
            breed: '',
            lifespan: '',
            petTypeId: '',
            image: ''
          }
        }
      }
    },
    methods: {
      submit () {
        // set the Amazon Cognito region
        AWS.config.region = CONFIG.region
        // initialize the Credentials object with our parameters
        var cognitoidentity = new AWS.CognitoIdentity()
        console.log("id from config file: " + CONFIG.identityPoolId)
        var params = {
          IdentityPoolId: CONFIG.identityPoolId
        }
        var payload = {
          duress: this.questions.question1.duress,
          walks: this.questions.question2.walks,
          sass: this.questions.question3.sass,
          travel: Number(this.questions.question4.travel),
          yap: this.questions.question5.yap,
          accommodation: this.questions.question6.accommodation,
          outside: this.questions.question7.outside
        }
        console.log('payload: ' + JSON.stringify(payload))
        console.log('payload: ' + JSON.stringify(payload.travel))
        var params = {
          IdentityPoolId: CONFIG.identityPoolId
        }
        var self = this
        AWS.config.region = CONFIG.region // Replace with the region you deploy
        // Generate a Cognito ID for the 1st time, so IdentityId could be kept for future use
        cognitoidentity.getId(params, function (err, data) {
          if (err) console.log(err, err.stack) // an error occurred
          else console.log(data) // successful response
          var params = {
            IdentityId: data.IdentityId
          }
          // Retrieve temp credentials with IdentityId
          cognitoidentity.getCredentialsForIdentity(params, function (err, data) {
            if (err) console.log(err, err.stack) // an error occurred
            else console.log(data) // successful response
            var apigClient = apigClientFactory.newClient({
              accessKey: data.Credentials.AccessKeyId,
              secretKey: data.Credentials.SecretKey,
              sessionToken: data.Credentials.SessionToken,
              region: CONFIG.region // Replace with the region you deploy
            })
            console.log('Cognito accessKey: ' + data.Credentials.AccessKeyId)
            console.log('Cognito SessionToken: ' + data.Credentials.SessionToken)
            apigClient.petmatchesPost({}, payload, {}).then(function (result) {
              console.log('Communication with API via API SDK a success.')
              console.log(result)
              // set the match results
              self.questions.matchResults = result.data
              // unhide the div
              var span = document.getElementById("hidden_div")
              span.style.display = ''
              self.questions.matchResults.image = "static/images/" + result.data.petTypeId + ".jpg"
              console.log("self: " + JSON.stringify(self.questions.matchResults))
            }).catch(function (result) {
              // This is where you would put an error callback
              console.log(result)
            })
          })
        })
      }
    }
  }
</script>
