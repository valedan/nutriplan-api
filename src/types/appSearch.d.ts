/* eslint-disable */
declare module "@elastic/app-search-node" {
  export = AppSearchClient;
  declare class AppSearchClient {
    /**
     * Creates a jwt search key that can be used for authentication to enforce a set of required search options.
     *
     * @param {String} apiKey the API Key used to sign the search key
     * @param {String} apiKeyName the unique name for the API Key
     * @param {Object} options Object see the <a href="https://swiftype.com/documentation/app-search/authentication#signed">App Search API</a> for supported search options
     * @returns {String} jwt search key
     */
    static createSignedSearchKey(apiKey: string, apiKeyName: string, options?: any): string;
    constructor(accountHostKey: any, apiKey: any, baseUrlFn?: (accountHostKey: any) => string);
    client: Client;
    /**
     * Send a search request to the App Search Api
     * https://swiftype.com/documentation/app-search/api/overview
     *
     * @param {String} engineName unique Engine name
     * @param {String} query String that is used to perform a search request.
     * @param {Object} options Object used for configuring the search like search_fields and result_fields
     * @returns {Promise<Object>} a Promise that returns a result {Object} when resolved, otherwise throws an Error.
     */
    search(engineName: string, query: string, options?: {}): Promise<any>;
    /**
     * Run multiple searches for documents on a single request
     *
     * @param {String} engineName unique Engine name
     * @param {Array} searches Searches to execute, [{query: String, options: Object}]
     * @returns {Promise<Object>} a Promise that returns an array of results {Object} when resolved, otherwise throws an Error.
     */
    multiSearch(engineName: string, searches: any[]): Promise<any>;
    /**
     * Sends a query suggestion request to the App Search Api
     *
     * @param {String} engineName unique Engine name
     * @param {String} query String that is used to perform a query suggestion request.
     * @param {Object} options Object used for configuring the request
     */
    querySuggestion(engineName: string, query: string, options?: any): Promise<any>;
    /**
     * Index a document.
     *
     * @param {String} engineName unique Engine name
     * @param {Object} document document object to be indexed.
     * @returns {Promise<Object>} a Promise that returns a result {Object} when resolved, otherwise throws an Error.
     */
    indexDocument(engineName: string, document: any): Promise<any>;
    /**
     * Index a batch of documents.
     *
     * @param {String} engineName unique Engine name
     * @param {Array<Object>} documents Array of document objects to be indexed.
     * @returns {Promise<Array<Object>>} a Promise that returns a result {Object} when resolved, otherwise throws an Error.
     */
    indexDocuments(engineName: string, documents: Array<any>): Promise<Array<any>>;
    /**
     * Partial update a batch of documents.
     *
     * @param {String} engineName unique Engine name
     * @param {Array<Object>} documents Array of document objects to be updated.
     * @returns {Promise<Array<Object>>} a Promise that returns an array of status objects, otherwise throws an Error.
     */
    updateDocuments(engineName: string, documents: Array<any>): Promise<Array<any>>;
    /**
     * List all documents
     *
     * @param {String} engineName unique Engine name
     * @param {Object} options see the <a href="https://swiftype.com/documentation/app-search/api/documents#list">App Search API</a> for supported search options
     * @returns {Promise<Array<Object>>} a Promise that returns an array of documents, otherwise throws an Error.
     */
    listDocuments(engineName: string, options?: any): Promise<Array<any>>;
    /**
     * Retrieve a batch of documents.
     *
     * @param {String} engineName unique Engine name
     * @param {Array<String>} ids Array of document ids to be retrieved
     * @returns {Promise<Array<Object>>} a Promise that returns an array of documents, otherwise throws an Error.
     */
    getDocuments(engineName: string, ids: Array<string>): Promise<Array<any>>;
    /**
     * Destroy a batch of documents.
     *
     * @param {String} engineName unique Engine name
     * @param {Array<String>} ids Array of document ids to be destroyed
     * @returns {Promise<Object>} a Promise that returns a result {Object} when resolved, otherwise throws an Error. Includes "result" keys to maintain backward compatibility.
     */
    destroyDocuments(engineName: string, ids: Array<string>): Promise<any>;
    /**
     * List all engines
     *
     * @returns {Promise<Object>} a Promise that returns a result {Object} when resolved, otherwise throws an Error.
     */
    listEngines(options?: {}): Promise<any>;
    /**
     * Retrieve an engine by name
     *
     * @param {String} engineName unique Engine name
     * @returns {Promise<Object>} a Promise that returns a result {Object} when resolved, otherwise throws an Error.
     */
    getEngine(engineName: string): Promise<any>;
    /**
     * Create a new engine
     *
     * @param {String} engineName unique Engine name
     * @param {Object} options
     * @returns {Promise<Object>} a Promise that returns a result {Object} when resolved, otherwise throws an Error.
     */
    createEngine(engineName: string, options: any): Promise<any>;
    /**
     * Add a Source Engine to a Meta Engine
     *
     * @param {String} engineName Name of Meta Engine
     * @param {Array[String]} sourceEngines Names of Engines to use as Source Engines
     * @returns {Promise<Object>} a Promise that returns a result {Object} when resolved, otherwise throws an Error.
     */
    addMetaEngineSources(engineName: string, sourceEngines: any): Promise<any>;
    /**
     * Remove a Source Engine from a Meta Engine
     *
     * @param {String} engineName Name of Meta Engine
     * @param {Array[String]} sourceEngines Names of existing Source Engines to remove
     * @returns {Promise<Object>} a Promise that returns a result {Object} when resolved, otherwise throws an Error.
     */
    deleteMetaEngineSources(engineName: string, sourceEngines: any): Promise<any>;
    /**
     * Delete an engine
     *
     * @param {String} engineName unique Engine name
     * @returns {Promise<Object>} a Promise that returns a result {Object} when resolved, otherwise throws an Error.
     */
    destroyEngine(engineName: string): Promise<any>;
    /**
     * List all Curations
     *
     * @param {String} engineName unique Engine name
     * @returns {Promise<Object>} a Promise that returns a result {Object} when resolved, otherwise throws an Error.
     */
    listCurations(engineName: string, options?: {}): Promise<any>;
    /**
     * Retrieve a Curation by id
     *
     * @param {String} engineName unique Engine name
     * @param {String} curationId unique Curation id
     * @returns {Promise<Object>} a Promise that returns a result {Object} when resolved, otherwise throws an Error.
     */
    getCuration(engineName: string, curationId: string): Promise<any>;
    /**
     * Create a new Curation
     *
     * @param {String} engineName unique Engine name
     * @param {Object} newCuration body of the Curation object
     * @returns {Promise<Object>} a Promise that returns a result {Object} when resolved, otherwise throws an Error.
     */
    createCuration(engineName: string, newCuration: any): Promise<any>;
    /**
     * Update an existing curation
     *
     * @param {String} engineName unique Engine name
     * @param {String} curationId unique Curation id
     * @param {Object} newCuration body of the Curation object
     * @returns {Promise<Object>} a Promise that returns a result {Object} when resolved, otherwise throws an Error.
     */
    updateCuration(engineName: string, curationId: string, newCuration: any): Promise<any>;
    /**
     * Create a new meta engine
     *
     * @param {String} engineName unique Engine name
     * @param {Array[String]} sourceEngines list of engine names to use as source engines
     * @returns {Promise<Object>} a Promise that returns a result {Object} when resolved, otherwise throws an Error.
     */
    createMetaEngine(engineName: string, sourceEngines: any): Promise<any>;
    /**
     * Delete a curation
     *
     * @param {String} engineName unique Engine name
     * @param {String} curationId unique Curation name
     * @returns {Promise<Object>} a Promise that returns a result {Object} when resolved, otherwise throws an Error.
     */
    destroyCuration(engineName: string, curationId: string): Promise<any>;
    /**
     * Retrieve a schema by engine name
     *
     * @param {String} engineName unique Engine name
     * @returns {Promise<Object>} a Promise that returns the current schema {Object} when resolved, otherwise throws an Error.
     */
    getSchema(engineName: string): Promise<any>;
    /**
     * Update an existing schema
     *
     * @param {String} engineName unique Engine name
     * @param {Object} schema body of schema object
     * @returns {Promise<Object>} a Promise that returns the current schema {Object} when resolved, otherwise throws an Error.
     */
    updateSchema(engineName: string, schema: any): Promise<any>;
  }
  import Client = require("./client");
}
