import { Action } from '@ngrx/store';
import * as AccountActions from './../actions/account.actions';

const initialState = [];

export function accountReducer(state = initialState, action: AccountActions.Actions) {

    switch (action.type) {
        case AccountActions.SET_ACCOUNTS:
            return [... state, ... action.payload];

        case AccountActions.REMOVE_ACCOUNT:
            return state.filter((account => account['_id'] !== action.payload));

        default:
            return state;
    }
}