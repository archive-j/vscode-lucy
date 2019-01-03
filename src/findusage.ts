/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const querystring = require('querystring');
const request = require('request');

module.exports = class GoReferenceProvider implements vscode.ReferenceProvider {
    public provideReferences(
        document: vscode.TextDocument, position: vscode.Position,
        options: { includeDeclaration: boolean }, token: vscode.CancellationToken):
        Thenable<vscode.Location[]> {
        return new Promise(function(resolve ,reject) {
            var u = "http://localhost:2018/ide/findUsage?file=" + querystring.escape(document.fileName) + "&line=" + 
            position.line + "&column=" + position.character ;
            console.log(u);
            request(u, function(error : any, response : any, body:any) {
                if(error) {
                    console.log(error);
                    reject(error);
                    return ; 
                }
                var usages = JSON.parse(body);
                if (!usages) {
                    reject("not found usages");
                    return;
                }
                var items = new Array();
                for(var i = 0 ; i < usages.length ; i ++ ) {
                    let v = usages[i];
                    var uri2 = vscode.Uri.file(v.pos.filename);
                    var position2 = new vscode.Range(
                        new vscode.Position(v.pos.startLine,v.pos.startColumnOffset) ,
                        new vscode.Position(v.pos.endLine,v.pos.endColumnOffset) );
                    var location =  new vscode.Location(uri2, position2);
                    items[i] = location; 
                } 
                resolve(items);
            });
        });
    }
};
