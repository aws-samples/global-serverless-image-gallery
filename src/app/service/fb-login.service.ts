import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as $ from 'jQuery';
import * as AWS from 'aws-sdk';

declare var FB: any;

@Injectable()
export class FbLoginService {

    constructor() {
        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s);
            js.id = id;
            js.src = "https://connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v2.12&appId="+environment.fbId+"&autoLogAppEvents=1";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

        ( < any > window).fbAsyncInit = () => {
            FB.init({
                appId: environment.fbId,
                cookie: true,
                xfbml: true,
                version: 'v2.2'
            });
            FB.getLoginStatus(response => {
                console.log('statusChangeCallback', response.status);

                if (response.status === 'connected' && response.authResponse) {
                    $('#main').removeClass('kv-hidden');
                    $('#login').addClass('kv-hidden');
                    $('#logout').css({ 'display': "block" });

                    AWS.config.region = environment.region;

                    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                        IdentityPoolId: environment.identityPoolId,
                        Logins: {
                            'graph.facebook.com': response.authResponse.accessToken
                        }
                    });

                    ( < AWS.CognitoIdentityCredentials > AWS.config.credentials).get(err => {
                        if (err) {
                            alert("alert: " + err);
                            return;
                        }
                    });

                } else {
                    $('#login').removeClass('kv-hidden');
                    $('#main').addClass('kv-hidden');

                }
            });
        }
    }
    login() {
        FB.login(response => {
            //   this.status$.next(response);
            if (response.authResponse) {
                console.log('You are now logged in.');
                $('#main').removeClass('kv-hidden');
                $('#login').addClass('kv-hidden');
                $('#logout').css({ 'display': "block" });
                

                AWS.config.region = environment.region;

                AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: environment.identityPoolId,
                    Logins: {
                        'graph.facebook.com': response.authResponse.accessToken
                    }
                });

                (< AWS.CognitoIdentityCredentials > AWS.config.credentials).get(err => {
                    if (err) {
                        alert("alert: " + err);
                        return;
                    }
                });

            } else {
                console.log('There was a problem logging you in.');
            }
        });
    }

    logout() {
        FB.logout(response => { 
            $('#login').removeClass('kv-hidden');
            $('#main').addClass('kv-hidden'); 
            $('#logout').css({ 'display': "none" });
        });
    }

}