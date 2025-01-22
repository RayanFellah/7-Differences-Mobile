// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: true,
    serverUrl: 'http://ec2-3-145-174-66.us-east-2.compute.amazonaws.com:3000',
    serverUrlAndPort: 'http://ec2-3-145-174-66.us-east-2.compute.amazonaws.com:3000',
    webSocketUrl: 'ws://ec2-3-145-174-66.us-east-2.compute.amazonaws.com:3000',
    auth: {
        domain: 'dev-umwcnoykg5jmzous.us.auth0.com',
        clientId: 'i2KmWP9wP9O2csrYCrt8ViI6izES1rvI',
    },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
