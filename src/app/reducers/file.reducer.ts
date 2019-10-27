import { Action } from '@ngrx/store';
import * as FileActions from './../actions/file.actions';

const initialState = [];

export function fileReducer(state = initialState, action: FileActions.Actions) {

    switch (action.type) {
        case FileActions.SET_MERGED_FILES:
            return [
                ... state,
                ... action.payload
            ];

        case FileActions.REMOVE_FILE:
            return state.filter((file => file['id'] !== action.payload));

        default:
            return state;
    }
}