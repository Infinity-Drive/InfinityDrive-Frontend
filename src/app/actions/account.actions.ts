import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

export const ADD_ACCOUNT       = '[ACCOUNT] Add';
export const REMOVE_ACCOUNT    = '[ACCOUNT] Remove';

export class AddAccount implements Action {
    readonly type = ADD_ACCOUNT;

    constructor(public payload) {}
}

export class RemoveAccount implements Action {
    readonly type = REMOVE_ACCOUNT;

    constructor(public payload) {}
}

export type Actions = AddAccount | RemoveAccount;