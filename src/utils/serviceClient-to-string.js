const bus = require("fruster-bus");
const log = require("fruster-log");

/**
 * Note: this service client was generated automatically by api doc @ 2018-10-16T17:36:58.269Z
 */
class UserServiceClient{

    constructor(){ throw "service client shouldn't be instanced"; }

    /**
     * All endpoints
     */
    static get endpoints(){

        return {

            ADD_ROLES: "user-service.add-roles",
            CREATE_USER: "user-service.create-user",
            DELETE_USER: "user-service.delete-user",
            GET_PROFILES_BY_QUERY: "user-service.get-profiles-by-query",
            GET_SCOPES: "user-service.get-scopes",
            GET_USER: "user-service.get-user",
            GET_USERS_BY_QUERY: "user-service.get-users-by-query",
            REMOVE_ROLES: "user-service.remove-roles",
            RESEND_VERIFICATION: "user-service.resend-verification",
            SET_PASSWORD: "user-service.set-password",
            UPDATE_PASSWORD: "user-service.update-password",
            UPDATE_PROFILE: "user-service.update-profile",
            UPDATE_USER: "user-service.update-user",
            VALIDATE_PASSWORD: "user-service.validate-password",
            VERIFY_EMAIL: "user-service.verify-email"

        };

    }

    /**
     * @typedef {Object} UserResponse  
     *
     * @property {String=} id Id of the user:
     * @property {String=} firstName The first name of the user.
     * @property {String=} lastName The last name of the user
     * @property {String=} middleName the middle name of the user.
     * @property {String=} email the email of the user.
     * @property {Array<String>} roles the roles of the user.
     * @property {Array<String>} scopes the scopes of the roles of the user.
     */

    /**
     * @typedef {Object} GetProfilesByQueryRequestFilter mongodb like filtering object in a String: Number fashion: firstName: 0 to exclude & firstName: 1 to include. 
     *
     * @property {Number=} id Just an example property.
     */

    /**
     * @typedef {Object} GetProfilesByQueryRequestSort mongodb like sort object in a String: Number fashion, e.g. { id: 1} to sort by id. 
     *
     * @property {Number=} id Just an example property.
     */

    /**
     * @typedef {Object} UserListResponse A fruster user. Without any custom fields: 
     *
     * @property {String=} id Id of the user:
     * @property {String=} firstName The first name of the user.
     * @property {String=} lastName The last name of the user
     * @property {String=} middleName the middle name of the user.
     * @property {String=} email the email of the user.
     * @property {Array<String>} roles the roles of the user.
     * @property {Array<String>} scopes the scopes of the roles of the user.
     */

    /**
     * @typedef {Object} GetUsersByQueryRequestFilter mongodb like filtering object in a String: Number fashion: firstName: 0 to exclude & firstName: 1 to include. 
     *
     * @property {Number=} id Just an example property.
     */

    /**
     * @typedef {Object} GetUsersByQueryRequestSort mongodb like sort object in a String: Number fashion, e.g. { id: 1} to sort by id. 
     *
     * @property {Number=} id Just an example property.
     */

    /**
     * @typedef {Object} GetUsersByQueryResponseUsers A fruster user. Without any custom fields: 
     *
     * @property {String=} id Id of the user:
     * @property {String=} firstName The first name of the user.
     * @property {String=} lastName The last name of the user
     * @property {String=} middleName the middle name of the user.
     * @property {String=} email the email of the user.
     * @property {Array<String>} roles the roles of the user.
     * @property {Array<String>} scopes the scopes of the roles of the user.
     */

    /**
     * @typedef {Object} GetUsersByQueryResponse  
     *
     * @property {Number=} totalCount The total count of results in the databse found with provided query
     * @property {Array<GetUsersByQueryResponseUsers>} users Response with an array of users.
     */

    /**
     * @typedef {Object} VerifyEmailAddressResponse  
     *
     * @property {String} verifiedEmail The verified email.
     */

    /**

     *
     * Adds inputted roles to specified user. Can only add roles existing in configuration. Response has status code `202` if successful.
     * 
     * @param {String} reqId the request id
     * @param {String} id Id of the user to add/remove roles to/from:
     * @param {Array<String>} roles An array of roles to add/remove to/from the user. The list must contain valid roles, the same as those configured.
     *
     * @return {Promise<Void>}
     */
    static async addRoles(reqId, id, roles){
        
        return (await bus.request({
            subject: UserServiceClient.endpoints.ADD_ROLES,
            message: {
                reqId, id, roles
            }
        })).data;
    }
    
    /**

     *
     * Creates a fruster user. Must include a few base fields but can contain any number of custom fields. Response has status code `201` if successful. Automatically splits data between user and profile if configured to.
     * 
     * @param {String} reqId the request id
     * @param {String} email The email of the user:
     * @param {String=} password the password of the user. Is required only if `config.requirePassword` is set to true.
     * @param {String} firstName The first name of the user:
     * @param {String=} middleName The middle name of the user :
     * @param {String} lastName The last name of the user.:
     *
     * @return {Promise<UserResponse>}
     */
    static async createUser(reqId, email, password, firstName, middleName, lastName){
        
        return (await bus.request({
            subject: UserServiceClient.endpoints.CREATE_USER,
            message: {
                reqId, email, password, firstName, middleName, lastName
            }
        })).data;
    }
    
    /**

     *
     * Deletes a user. Response has status code `200` if successful. `pub.user-service.user-deleted` is published after deletion
     * 
     * @param {String} reqId the request id
     * @param {String} id The id of the user to delete.:
     *
     * @return {Promise<Void>}
     */
    static async deleteUser(reqId, id){
        
        return (await bus.request({
            subject: UserServiceClient.endpoints.DELETE_USER,
            message: {
                reqId, id
            }
        })).data;
    }
    
    /**

     *
     * Gets profiles by query. Return data may vary depending on the configuration.
     * 
     * @param {String} reqId the request id
     * @param {Object} query mongodb like query object in a String: any fashion, e.g. { id: { $in: ['7a967d8b-8a25-4d20-b0e9-8ebe9383d488', '9f6b47c0-628c-45ca-8c43-8a99bf37e241'] }} to get users with ids '7a967d8b-8a25-4d20-b0e9-8ebe9383d488' and '9f6b47c0-628c-45ca-8c43-8a99bf37e241.'
     * @param {GetProfilesByQueryRequestFilter=} filter mongodb like filtering object in a String: Number fashion: firstName: 0 to exclude & firstName: 1 to include.
     * @param {Number=} start Index to start results from.
     * @param {Number=} limit Number of results.
     * @param {GetProfilesByQueryRequestSort=} sort mongodb like sort object in a String: Number fashion, e.g. { id: 1} to sort by id.
     *
     * @return {Promise<Void>}
     */
    static async getProfilesByQuery(reqId, query, filter, start, limit, sort){
        
        return (await bus.request({
            subject: UserServiceClient.endpoints.GET_PROFILES_BY_QUERY,
            message: {
                reqId, query, filter, start, limit, sort
            }
        })).data;
    }
    
    /**

     *
     * Gets all scopes for specified roles in a flat array. E.g. input ['admin', 'user', 'super-admin'] would return  ['*', 'admin.*', 'profile.get']. Response has status code` 20`0 if successful.
     * 
     * @param {String} reqId the request id
     *
     * @return {Promise<String>}
     */
    static async getScopes(reqId){
        
        return (await bus.request({
            subject: UserServiceClient.endpoints.GET_SCOPES,
            message: {
                reqId
            }
        })).data;
    }
    
    /**
     * @deprecated Use user-service.get-users-by-query instead.
     *
     * Gets users by query. Response has status code `200` if successful.
     * 
     * @param {String} reqId the request id
     *
     * @return {Promise<UserListResponse>}
     */
    static async getUser(reqId){
        log.warn("Using deprecated endpoint getUser")
        return (await bus.request({
            subject: UserServiceClient.endpoints.GET_USER,
            message: {
                reqId
            }
        })).data;
    }
    
    /**

     *
     * Gets users by query. Return data may vary depending on the configuration. 

 Can be expanded to return both user and profile data using `expand: "profile"` if configured to split the data. If expand is used; the query can be used to query profile fields as well: `{ "profile.firstName": "Bob" }`. With expand; the data is returned `{...userData, profile: {...profileData}}`
     * 
     * @param {String} reqId the request id
     * @param {Object} query mongodb like query object in a String: any fashion, e.g. { id: { $in: ['7a967d8b-8a25-4d20-b0e9-8ebe9383d488', '9f6b47c0-628c-45ca-8c43-8a99bf37e241'] }} to get users with ids '7a967d8b-8a25-4d20-b0e9-8ebe9383d488' and '9f6b47c0-628c-45ca-8c43-8a99bf37e241.'
     * @param {GetUsersByQueryRequestFilter=} filter mongodb like filtering object in a String: Number fashion: firstName: 0 to exclude & firstName: 1 to include.
     * @param {Number=} start Index to start results from.
     * @param {Number=} limit Number of results.
     * @param {GetUsersByQueryRequestSort=} sort mongodb like sort object in a String: Number fashion, e.g. { id: 1} to sort by id.
     * @param {String=} expand Whether or not to expand user object with its profile.
     *
     * @return {Promise<GetUsersByQueryResponse>}
     */
    static async getUsersByQuery(reqId, query, filter, start, limit, sort, expand){
        
        return (await bus.request({
            subject: UserServiceClient.endpoints.GET_USERS_BY_QUERY,
            message: {
                reqId, query, filter, start, limit, sort, expand
            }
        })).data;
    }
    
    /**

     *
     * Removes inputted roles from specified user. Cannot remove the last role. Response has status code `202` if successful.
     * 
     * @param {String} reqId the request id
     * @param {String} id Id of the user to add/remove roles to/from:
     * @param {Array<String>} roles An array of roles to add/remove to/from the user. The list must contain valid roles, the same as those configured.
     *
     * @return {Promise<Void>}
     */
    static async removeRoles(reqId, id, roles){
        
        return (await bus.request({
            subject: UserServiceClient.endpoints.REMOVE_ROLES,
            message: {
                reqId, id, roles
            }
        })).data;
    }
    
    /**

     *
     * Generates a new email verification token and resends email w/ token to the provided user. Response has status code `200` if successful.
     * 
     * @param {String} reqId the request id
     * @param {String=} email The email address to resent the verification email to.
     *
     * @return {Promise<Void>}
     */
    static async resendVerification(reqId, email){
        
        return (await bus.request({
            subject: UserServiceClient.endpoints.RESEND_VERIFICATION,
            message: {
                reqId, email
            }
        })).data;
    }
    
    /**

     *
     * Sets password of a user. Used by password reset service. Note: Updating a user's password should be done w/ the update-password endpoint. Response has status code `202` if successful.
     * 
     * @param {String} reqId the request id
     * @param {String} id Id of the user to set password for.
     * @param {String} newPassword The new password to set for the user.
     *
     * @return {Promise<Void>}
     */
    static async setPassword(reqId, id, newPassword){
        
        return (await bus.request({
            subject: UserServiceClient.endpoints.SET_PASSWORD,
            message: {
                reqId, id, newPassword
            }
        })).data;
    }
    
    /**

     *
     * Updates password of an account. Requires to validation of old password before new can be set. Response has status code `202` if successful.
     * 
     * @param {String} reqId the request id
     * @param {String} newPassword The new password to update with.
     * @param {String} oldPassword The old password of the user, requires this to be validated against the account details.
     * @param {String} id The id of the user to update password for.
     *
     * @return {Promise<Void>}
     */
    static async updatePassword(reqId, newPassword, oldPassword, id){
        
        return (await bus.request({
            subject: UserServiceClient.endpoints.UPDATE_PASSWORD,
            message: {
                reqId, newPassword, oldPassword, id
            }
        })).data;
    }
    
    /**

     *
     * Updates a user. Can contain any number of custom fields. Response has status code `200` if successful. 
     * 
     * @param {String} reqId the request id
     * @param {String} id Id of the user:
     * @param {String=} firstName The first name of the user.
     * @param {String=} lastName The last name of the user
     * @param {String=} middleName the middle name of the user.
     * @param {String=} email the email of the user.
     *
     * @return {Promise<Void>}
     */
    static async updateProfile(reqId, id, firstName, lastName, middleName, email){
        
        return (await bus.request({
            subject: UserServiceClient.endpoints.UPDATE_PROFILE,
            message: {
                reqId, id, firstName, lastName, middleName, email
            }
        })).data;
    }
    
    /**

     *
     * Updates a user. Can contain any number of custom fields. Response has status code `200` if successful. 
     * 
     * @param {String} reqId the request id
     * @param {String} id Id of the user:
     * @param {String=} firstName The first name of the user.
     * @param {String=} lastName The last name of the user
     * @param {String=} middleName the middle name of the user.
     * @param {String=} email the email of the user.
     *
     * @return {Promise<UserResponse>}
     */
    static async updateUser(reqId, id, firstName, lastName, middleName, email){
        
        return (await bus.request({
            subject: UserServiceClient.endpoints.UPDATE_USER,
            message: {
                reqId, id, firstName, lastName, middleName, email
            }
        })).data;
    }
    
    /**

     *
     * Validates that inputted password becomes the same hash as for an account. Typically used by auth service for login. Response has status code `200` if successful.
     * 
     * @param {String} reqId the request id
     * @param {String} username The username of the account to validate. Determined by config.USERNAME_VALIDATION_DB_FIELD.
     * @param {String} password The password to validate against account with.
     *
     * @return {Promise<UserResponse>}
     */
    static async validatePassword(reqId, username, password){
        
        return (await bus.request({
            subject: UserServiceClient.endpoints.VALIDATE_PASSWORD,
            message: {
                reqId, username, password
            }
        })).data;
    }
    
    /**

     *
     * Verifies a user's email address by providing a token sent to the user by email. Response has status code `200` if successful.
     * 
     * @param {String} reqId the request id
     * @param {String=} tokenId The email verification token to verify with.
     *
     * @return {Promise<VerifyEmailAddressResponse>}
     */
    static async verifyEmail(reqId, tokenId){
        
        return (await bus.request({
            subject: UserServiceClient.endpoints.VERIFY_EMAIL,
            message: {
                reqId, tokenId
            }
        })).data;
    }
    
}

module.exports = UserServiceClient;