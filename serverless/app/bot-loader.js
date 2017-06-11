'use strict';

(function (document, window) {
  var OPTIONS = {
    // div container class to insert iframe
    containerClass: 'lex-chat',

    // iframe source uri. use embed=true query string when loading as iframe
   iframeSrcPath: '/index.html#/?embed=true',

    // AWS SDK script dynamically added to the DOM
    // https://github.com/aws/aws-sdk-js
    sdkLink: 'https://sdk.amazonaws.com/js/aws-sdk-2.60.0.min.js',
  };

  /*
  config variable loads from configUrl. It should contain the
  following keys:
    # origin contains proto://host:port
    # port needed if not default 80 for htt or 443 for https
    iframeOrigin

    # AWS config
    aws:
      # AWS Region
      region:

      # Cognito Pool Id
      cognitoPoolId:
  */
  var config = {};
  var configUrl = 'config.json';

  var iframe;
  var container;
  var messageHandler = {};

  if (isSupported()) {
    // initialize iframe once the DOM is loaded
    document.addEventListener('DOMContentLoaded', main, false);
  } else {
    console.warn('chat bot not loaded - unsupported browser');
  }

  /**
   * Check if modern browser features used by chat bot are supported
   */
  function isSupported() {
    var features = [
      'localStorage',
      'Audio',
      'Blob',
      'Promise',
      'URL',
    ];
    return features.every(function(feature) {
      return feature in window;
    });
  }

  function main() {
    loadConfig(configUrl)
    .then(function assignConfig(conf) {
      config = conf;
      return Promise.resolve();
    })
    .then(function addContainerPromise() {
      return addContainer(OPTIONS.containerClass);
    })
    .then(function assignContainer(containerParam) {
      container = containerParam;
      return Promise.resolve();
    })
    .then(function addAwsSdkPromise() {
      return addAwsSdk(container, config);
    })
    .then(function initCredentialsPromise() {
      return initCredentials(config);
    })
    .then(function getCredentialsPromise() {
      return getCredentials();
    })
    .then(function addMessageHandler() {
      window.addEventListener('message', onMessage, false);
      return Promise.resolve();
    })
    .then(function addIframePromise() {
      return addIframe(container);
    })
    .then(function assignIframe(iframeParam) {
      iframe = iframeParam;
      return Promise.resolve();
    })
    .then(function parentReady() {
      iframe.contentWindow.postMessage(
        { event: 'parentReady' },
        config.iframeOrigin
      );
    })
    .catch(function initError(error) {
      console.error('could not initialize chat bot -', error);
    });
  }

  function doNothing() {}

  /**
   * Loads the bot config from a JSON file URL
   */
  function loadConfig(url) {
    return new Promise(function loadConfigPromise(resolve, reject) {
      var config =  {
  "iframeOrigin": "https://lex-web-ui-pipeline-12eyn8bbnul2g-webappbucket-10irip7ec14fx.s3.amazonaws.com",
  "aws": {
    "cognitoPoolId": "us-east-1:e004fdac-d6bf-4ea9-acd1-323817666777",
    "region": "us-east-1"
  },
  "iframeConfig": {
    "lex": {
      "sessionAttributes": {}
    },
    "ui": {},
    "recorder": {
      "preset": "speech_recognition"
    }
  }
   }   ;
 if (config) {
            resolve(config);
          } else {
            reject('invalid chat bot config object');
          }
    });
  };

  /**
   * Adds a div container to document body which will wrap the chat bot iframe
   */
  function addContainer(containerClass) {
    var divElement = document.querySelector('.' + containerClass);
    if (!containerClass) {
      return Promise.reject('invalid chat bot container class: ' + containerClass);
    }
    if (divElement) {
      return Promise.resolve(divElement);
    }
    divElement = document.createElement('div');
    divElement.classList.add(containerClass);
    document.body.appendChild(divElement);

    return Promise.resolve(divElement);
  }

  /**
   * Adds a script tag to dynamically load the AWS SDK under the application
   * div container. Avoids loading the SDK if the AWS SDK seems to be loaded
   * or the tag exists
   */
  function addAwsSdk(divElement) {
    return new Promise(function addAwsSdkPromise(resolve, reject) {
      var sdkScriptElement =
        document.querySelector('.' + OPTIONS.containerClass + ' script');
      if (sdkScriptElement || 'AWS' in window) {
        resolve(sdkScriptElement);
      }

      sdkScriptElement = document.createElement('script');
      sdkScriptElement.setAttribute('type', 'text/javascript');

      sdkScriptElement.onerror = function  sdkOnError() {
        reject('failed to load AWS SDK link:' + OPTIONS.sdkLink);
      };
      sdkScriptElement.onload = function  sdkOnLoad() {
        resolve(sdkScriptElement);
      };

      sdkScriptElement.setAttribute('src', OPTIONS.sdkLink);

      divElement.appendChild(sdkScriptElement);
    });
  }

  /**
   * Initializes credentials
   */
  function initCredentials(config) {
    if (!'AWS' in window) {
      return Promise.reject('unable to find AWS object');
    }

    AWS.config.region = config.aws.region;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: config.aws.cognitoPoolId,
    });

    return Promise.resolve();
  }

  /**
   * Get credentials - cognito
   */
  function getCredentials() {
    console.log("within getCredentials");
    var identityId = localStorage.getItem('cognitoid');

    if (identityId != null){
      console.log('[INFO] found existing identity ID: ', identityId);
    }

    if (!('getPromise' in AWS.config.credentials)) {
      console.error('getPromise not found in credentials');
      return Promise.reject('getPromise not found in credentials');
    }

    return AWS.config.credentials.getPromise()
    .then(function storeIdentityId() {
      console.log('[INFO] storing identity ID:',
        AWS.config.credentials.identityId
      );
      localStorage.setItem('cognitoid', AWS.config.credentials.identityId);
      identityId = localStorage.getItem('cognitoid');
    })
    .then(function getCredentialsPromise() {
      console.log("getting credentials");
      return Promise.resolve(AWS.config.credentials);

    });
  }

  /**
   * Adds chat bot iframe under the application div container
   */
  function addIframe(divElement) {
    var iframeElement =
      document.querySelector('.' + OPTIONS.containerClass + ' iframe');
    if (iframeElement) {
      return Promise.resolve(iframeElement);
    }

    iframeElement = document.createElement('iframe');
    iframeElement.setAttribute('src', config.iframeOrigin + OPTIONS.iframeSrcPath);
    iframeElement.setAttribute('frameBorder', '0');
    iframeElement.setAttribute('scrolling', 'no');

    divElement.appendChild(iframeElement);

    return new Promise(function loadIframePromise(resolve, reject) {
      var timeoutId = setTimeout(onIframeTimeout, 10000);
      iframeElement.addEventListener('load', onIframeLoaded, false);

      function onIframeLoaded(evt) {
        clearTimeout(timeoutId);
        toggleShowUi();
        return resolve(iframeElement);
      };

      function onIframeTimeout() {
        iframeElement.removeEventListener('load', onIframeLoaded, false);
        return reject('iframe load timeout');
      };
    });
  }

  /**
   * Toggle between showing/hiding chat bot ui
   */
  function toggleShowUi() {
    container.classList.toggle(OPTIONS.containerClass + '--show');
  }

  /**
   * Message handler - receives postMessage events from iframe
   */
  function onMessage(evt) {
    // security check
    if (evt.origin !== config.iframeOrigin) {
      console.warn('postMessage frrom invalid origin', evt.origin);
      return;
    }
    if (!evt.ports) {
      console.error('postMessage not sent over MessageChannel', evt);
      return;
    }

    switch (evt.data.event) {
      case 'getCredentials':
        messageHandler.onGetCredentials(evt);
        break;
      case 'initIframeConfig':
        messageHandler.onInitIframeConfig(evt);
        break;
      case 'toggleExpandUi':
        messageHandler.onToggleExpandUi(evt);
        break;
      case 'updateLexState':
        messageHandler.onUpdateLexState(evt);
        break;
      default:
        console.error('unknown message in event', evt);
        break;
    }
  }

  messageHandler = {
    onGetCredentials: function onGetCredentials(evt) {
      return getCredentials()
      .then(function resolveGetCredentials(creds) {
        evt.ports[0].postMessage({
          event: 'resolve',
          type: 'getCredentials',
          data: creds,
        });
      })
      .catch(function onGetCredentialsError(error) {
        console.error('failed to get credentials', error);
        evt.ports[0].postMessage({
          event: 'reject',
          type: 'getCredentials',
          error: 'failed to get credentials',
        });
      });
    },
    onInitIframeConfig: function onInitIframeConfig(evt) {
      var iframeConfig = config.iframeConfig;
      try {
        iframeConfig.cognito = {
          poolId: config.aws.cognitoPoolId,
        };
        iframeConfig.region = config.aws.region;
        // place dynamic initialization logic in here
      } catch (e) {
        evt.ports[0].postMessage({
          event: 'reject',
          type: 'initIframeConfig',
          error: 'failed to obtain a valid iframe config',
        });
        console.error('failed to assign iframe config', e);
        return;
      }
      evt.ports[0].postMessage({
        event: 'resolve',
        type: 'initIframeConfig',
        data: iframeConfig,
      });
    },
    onToggleExpandUi: function onToggleExpandUi(evt) {
      container.classList.toggle(OPTIONS.containerClass + '--minimize');
      evt.ports[0].postMessage({ event: 'resolve', type: 'toggleShowUi' });
    },
    onUpdateLexState: function onUpdateLexState(evt) {
      // evt.data will contain the Lex state

      // send resolve ressponse to the chatbot ui
      evt.ports[0].postMessage({ event: 'resolve', type: 'updateLexState' });

      // relay event to parent
      var event = new CustomEvent('updatelexstate', { 'detail': evt.data });
      document.dispatchEvent(event);
    },
  };
})(document, window);
