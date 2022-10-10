import { inject } from '@loopback/core';
import { Model, model, property } from '@loopback/repository';
import { LbxJwtBindings } from '../../keys';
import { Jwt } from '../../models';

/**
 * The authentication data that is send to the user.
 * This is needed eg. To Display navigation elements only if the user has the required role.
 */
@model()
export class AuthData<RoleType extends string> extends Model {
    /**
     * The token used for authenticating requests.
     * Consists of the string value and the expirationDate value.
     */
    @property({
        type: 'object',
        required: true,
        jsonSchema: {
            properties: {
                value: {
                    type: 'string'
                },
                expirationDate: {
                    type: 'string'
                }
            },
            required: ['value', 'expirationDate']
        }
    })
    accessToken: Jwt;
    /**
     * The token used for refreshing the access token.
     * Consists of the string value and the expirationDate value.
     */
    @property({
        type: 'object',
        required: true,
        jsonSchema: {
            properties: {
                value: {
                    type: 'string'
                },
                expirationDate: {
                    type: 'string'
                }
            },
            required: ['value', 'expirationDate']
        }
    })
    refreshToken: Jwt;
    /**
     * All roles of the currently logged in user.
     * Consists of an displayName and the actual string value.
     */
    @property({
        type: 'array',
        itemType: 'string',
        required: true
        // json schema restricting to certain roles is set in constructor.
    })
    roles: RoleType[];
    /**
     * The id of the currently logged in user.
     */
    @property({
        type: 'string',
        required: true
    })
    userId: string;

    /**
     * Helper for defining the roles open api.
     */
    @inject(LbxJwtBindings.ROLES)
    private readonly roleValues: RoleType[];

    constructor(data?: Partial<AuthData<RoleType>>) {
        super(data);
        AuthData.definition.properties['roles'].jsonSchema = {
            items: {
                enum: this.roleValues
            }
        };
    }
}