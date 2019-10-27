import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

export const SET_MERGED_FILES       = 'SET_MERGED_FILES';
export const REMOVE_FILE            = 'REMOVE_FILE';
export const GET_ACCOUNT_FILES      = 'GET_ACCOUNT_FILES';

export class SetMergedFiles implements Action {
    readonly type = SET_MERGED_FILES;

    constructor(public payload) {}
}

export class RemoveFile implements Action {
    readonly type = REMOVE_FILE;

    constructor(public payload) {}
}

export class GetAccountFiles implements Action {
    readonly type = GET_ACCOUNT_FILES;

    constructor(public payload) {}
}


export type Actions = SetMergedFiles | RemoveFile | GetAccountFiles;