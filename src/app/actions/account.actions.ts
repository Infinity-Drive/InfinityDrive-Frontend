import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

export const SET_ACCOUNTS       = '[ACCOUNTS] Set';
export const REMOVE_ACCOUNT     = '[ACCOUNT] Remove';

export class SetAccounts implements Action {
    readonly type = SET_ACCOUNTS;

    constructor(public payload) {}
}

export class RemoveAccount implements Action {
    readonly type = REMOVE_ACCOUNT;

    constructor(public payload) {}
}

export type Actions = SetAccounts | RemoveAccount;