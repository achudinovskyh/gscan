const _ = require('lodash');
const {oneLineTrim} = require('common-tags');
const previousSpec = require('./v1');
const ghostVersions = require('../utils').versions;
const docsBaseUrl = `https://ghost.org/docs/api/handlebars-themes/`;
const prevDocsBaseUrl = `https://themes.ghost.org/v${ghostVersions.v1.docs}/docs/`;
const prevDocsBaseUrlRegEx = new RegExp(prevDocsBaseUrl, 'g');

const previousKnownHelpers = previousSpec.knownHelpers;
const previousTemplates = previousSpec.templates;
const previousRules = previousSpec.rules;

// assign new or overwrite existing knownHelpers, templates, or rules here:
let knownHelpers = ['link', 'link_class', 'concat'];
let templates = [];
let rules = {
    // New rules
    'GS001-DEPR-USER-GET': {
        level: 'error',
        rule: `<code>{{#get "users"}}</code> should be replaced with <code>{{#get "authors"}}</code>`,
        details: oneLineTrim`The usage of <code>{{#get "users"}}</code> is deprecated and will not return any data. It should be replaced with <code>{{#get "authors"}}</code>.<br>
        Find more information about the <code>{{get}}</code> helper <a href="${docsBaseUrl}helpers/get/" target=_blank>here</a>.`,
        regex: /{{\s*?#get ("|')\s*users("|')\s*/g,
        helper: '{{#get "users"}}'
    },
    'GS001-DEPR-AUTH-INCL': {
        level: 'error',
        rule: `<code>include="author"</code> should be replaced with <code>include="authors"</code>`,
        details: oneLineTrim`The usage of <code>{{#get "posts" include="author"}}</code> is deprecated and should be replaced with <code>{{#get "posts" include="authors"}}</code>.<br>
        Find more information about the <code>{{get}}</code> helper <a href="${docsBaseUrl}helpers/get/" target=_blank>here</a>.`,
        // This regex seems only to work properly with the escaped characters. Removing them resulted
        // in not detecting the wrong usage.
        regex: /{{\s*?#get.+include=("|')\s*?([\w\[\]]+,{1}\s*?)*?(\s*?author\s*?)(\s*,{1}\s?[\w\[\]]+)*?\s*?("|')(.*)}}/g, // eslint-disable-line no-useless-escape
        helper: 'include="author"'
    },
    'GS001-DEPR-AUTH-FIELD': {
        level: 'error',
        rule: `<code>fields="author"</code> should be replaced with <code>fields="authors"</code>`,
        details: oneLineTrim`The usage of <code>{{#get "posts" fields="author"}}</code> is deprecated and should be replaced with
        <code>{{#get "posts" fields="primary_author"}}</code> or <code>{{#get "posts" fields="authors.[#]"}}</code>.<br>
        Find more information about the <code>{{get}}</code> helper <a href="${docsBaseUrl}helpers/get/" target=_blank>here</a>.`,
        // This regex seems only to work properly with the escaped characters. Removing them resulted
        // in not detecting the wrong usage.
        regex: /{{\s*?#get.+fields=("|')\s*?([\w\[\]]+,{1}\s*?)*?(\s*?author\s*?)(\s*,{1}\s?[\w\[\]]+)*?\s*?("|')(.*)}}/g, // eslint-disable-line no-useless-escape
        helper: 'fields="author"'
    },
    'GS001-DEPR-AUTH-FILT': {
        level: 'error',
        rule: `<code>filter="author:[...]"</code> should be replaced with <code>filter="authors:[...]"</code>`,
        details: oneLineTrim`The usage of <code>{{#get "posts" filter="author:[...]"}}</code> is deprecated and should be replaced with <code>{{#get "posts" filter="authors:[...]"}}</code>.<br>
        Find more information about the <code>{{get}}</code> helper <a href="${docsBaseUrl}helpers/get/" target=_blank>here</a>.`,
        // This regex seems only to work properly with the escaped characters. Removing them resulted
        // in not detecting the wrong usage.
        regex: /{{\s*?#get.+filter=("|')\s*?([\w\[\]]+,{1}\s*?)*?(\s*?author:).*("|')(.*)}}/g, // eslint-disable-line no-useless-escape
        helper: 'filter="author:[...]"'
    },
    'GS001-DEPR-AUTHBL': {
        level: 'error',
        rule: 'The <code>{{#author}}</code> block helper should be replaced with <code>{{#primary_author}}</code> or <code>{{#foreach authors}}...{{/foreach}}</code>',
        details: oneLineTrim`The usage of <code>{{#author}}</code> block helper outside of <code>author.hbs</code> is deprecated and
        should be replaced with <code>{{#primary_author}}</code> or <code>{{#foreach authors}}...{{/foreach}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?#author\s*?}}/g,
        notValidIn: 'author.hbs',
        helper: '{{#author}}'
    },
    'GS001-DEPR-CON-AUTH': {
        level: 'error',
        rule: `The <code>{{#if author.*}}</code> block helper should be replaced with <code>{{#if primary_author.*}}</code>
        or <code>{{#if authors.[#].*}}</code>`,
        details: oneLineTrim`The usage of <code>{{#if author.*}}</code> is deprecated and should be replaced with <code>{{#if primary_author.*}}</code>
        or <code>{{#if authors.[#].*}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?#if\s*?(author)(?:\.\w+)*?\s*?}}/g,
        helper: '{{#if author.*}}'
    },
    'GS001-DEPR-CON-PAUTH': {
        level: 'error',
        rule: `The <code>{{#if post.author.*}}</code> block helper should be replaced with <code>{{#if post.primary_author.*}}</code>
        or <code>{{#if post.authors.[#].*}}</code>`,
        details: oneLineTrim`The usage of <code>{{#if post.author.*}}</code> is deprecated and should be replaced with <code>{{#if post.primary_author.*}}</code>
        or <code>{{#if post.authors.[#].*}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?#if\s*?(?:post\.)(author)(?:\.\w+)*?\s*?}}/g,
        helper: '{{#if post.author.*}}'
    },
    'GS001-DEPR-AUTH': {
        level: 'error',
        rule: '<code>{{author}}</code> should be replaced with <code>{{authors}}</code>',
        details: oneLineTrim`The usage of <code>{{author}}</code> is deprecated and should be replaced with <code>{{authors}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?author\s*?}}/g,
        helper: '{{author}}'
    },
    'GS001-DEPR-AUTH-ID': {
        level: 'error',
        rule: 'Replace the <code>{{author.id}}</code> helper with <code>{{primary_author.id}}</code> or <code>{{authors.[#].id}}</code>',
        details: oneLineTrim`The usage of <code>{{author.id}}</code> is deprecated and should be replaced with either <code>{{primary_author.id}}</code>
        or <code>{{authors.[#].id}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?author\.id\s*?}}/g,
        helper: '{{author.id}}'
    },
    'GS001-DEPR-AUTH-SLUG': {
        level: 'error',
        rule: 'Replace the <code>{{author.slug}}</code> helper with <code>{{primary_author.slug}}</code> or <code>{{authors.[#].slug}}</code>',
        details: oneLineTrim`The usage of <code>{{author.slug}}</code> is deprecated and should be replaced with either <code>{{primary_author.slug}}</code>
        or <code>{{authors.[#].slug}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?author\.slug\s*?}}/g,
        helper: '{{author.slug}}'
    },
    'GS001-DEPR-AUTH-MAIL': {
        level: 'error',
        rule: 'Replace the <code>{{author.email}}</code> helper with <code>{{primary_author.email}}</code> or <code>{{authors.[#].email}}</code>',
        details: oneLineTrim`The usage of <code>{{author.email}}</code> is deprecated and should be replaced with either <code>{{primary_author.email}}</code>
        or <code>{{authors.[#].email}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?author\.email\s*?}}/g,
        helper: '{{author.email}}'
    },
    'GS001-DEPR-AUTH-MT': {
        level: 'error',
        rule: 'Replace the <code>{{author.meta_title}}</code> helper with <code>{{primary_author.meta_title}}</code> or <code>{{authors.[#].meta_title}}</code>',
        details: oneLineTrim`The usage of <code>{{author.meta_title}}</code> is deprecated and should be replaced with either <code>{{primary_author.meta_title}}</code>
        or <code>{{authors.[#].meta_title}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?author\.meta_title\s*?}}/g,
        helper: '{{author.meta_title}}'
    },
    'GS001-DEPR-AUTH-MD': {
        level: 'error',
        rule: 'Replace the <code>{{author.meta_description}}</code> helper with <code>{{primary_author.meta_description}}</code> or <code>{{authors.[#].meta_description}}</code>',
        details: oneLineTrim`The usage of <code>{{author.meta_description}}</code> is deprecated and should be replaced with either <code>{{primary_author.meta_description}}</code>
        or <code>{{authors.[#].meta_description}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?author\.meta_description\s*?}}/g,
        helper: '{{author.meta_description}}'
    },
    'GS001-DEPR-AUTH-NAME': {
        level: 'error',
        rule: 'Replace the <code>{{author.name}}</code> helper with <code>{{primary_author.name}}</code> or <code>{{authors.[#].name}}</code>',
        details: oneLineTrim`The usage of <code>{{author.name}}</code> is deprecated and should be replaced with either <code>{{primary_author.name}}</code>
        or <code>{{authors.[#].name}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?author\.name\s*?}}/g,
        helper: '{{author.name}}'
    },
    'GS001-DEPR-AUTH-BIO': {
        level: 'error',
        rule: 'Replace the <code>{{author.bio}}</code> helper with <code>{{primary_author.bio}}</code> or <code>{{authors.[#].bio}}</code>',
        details: oneLineTrim`The usage of <code>{{author.bio}}</code> is deprecated and should be replaced with either <code>{{primary_author.bio}}</code>
        or <code>{{authors.[#].bio}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?author\.bio\s*?}}/g,
        helper: '{{author.bio}}'
    },
    'GS001-DEPR-AUTH-LOC': {
        level: 'error',
        rule: 'Replace the <code>{{author.location}}</code> helper with <code>{{primary_author.location}}</code> or <code>{{authors.[#].location}}</code>',
        details: oneLineTrim`The usage of <code>{{author.location}}</code> is deprecated and should be replaced with either <code>{{primary_author.location}}</code>
        or <code>{{authors.[#].location}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?author\.location\s*?}}/g,
        helper: '{{author.location}}'
    },
    'GS001-DEPR-AUTH-WEB': {
        level: 'error',
        rule: 'Replace the <code>{{author.website}}</code> helper with <code>{{primary_author.website}}</code> or <code>{{authors.[#].website}}</code>',
        details: oneLineTrim`The usage of <code>{{author.website}}</code> is deprecated and should be replaced with either <code>{{primary_author.website}}</code>
        or <code>{{authors.[#].website}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?author\.website\s*?}}/g,
        helper: '{{author.website}}'
    },
    'GS001-DEPR-AUTH-TW': {
        level: 'error',
        rule: 'Replace the <code>{{author.twitter}}</code> helper with <code>{{primary_author.twitter}}</code> or <code>{{authors.[#].twitter}}</code>',
        details: oneLineTrim`The usage of <code>{{author.twitter}}</code> is deprecated and should be replaced with either <code>{{primary_author.twitter}}</code>
        or <code>{{authors.[#].twitter}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?author\.twitter\s*?}}/g,
        helper: '{{author.twitter}}'
    },
    'GS001-DEPR-AUTH-FB': {
        level: 'error',
        rule: 'Replace the <code>{{author.facebook}}</code> helper with <code>{{primary_author.facebook}}</code> or <code>{{authors.[#].facebook}}</code>',
        details: oneLineTrim`The usage of <code>{{author.facebook}}</code> is deprecated and should be replaced with either <code>{{primary_author.facebook}}</code>
        or <code>{{authors.[#].facebook}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?author\.facebook\s*?}}/g,
        helper: '{{author.facebook}}'
    },
    'GS001-DEPR-AUTH-PIMG': {
        level: 'error',
        rule: 'Replace the <code>{{author.profile_image}}</code> helper with <code>{{primary_author.profile_image}}</code> or <code>{{authors.[#].profile_image}}</code>',
        details: oneLineTrim`The usage of <code>{{author.profile_image}}</code> is deprecated and should be replaced with either <code>{{primary_author.profile_image}}</code>
        or <code>{{authors.[#].profile_image}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?author\.profile_image\s*?}}/g,
        helper: '{{author.profile_image}}'
    },
    'GS001-DEPR-AUTH-CIMG': {
        level: 'error',
        rule: 'Replace the <code>{{author.cover_image}}</code> helper with <code>{{primary_author.cover_image}}</code> or <code>{{authors.[#].cover_image}}</code>',
        details: oneLineTrim`The usage of <code>{{author.cover_image}}</code> is deprecated and should be replaced with either <code>{{primary_author.cover_image}}</code>
        or <code>{{authors.[#].cover_image}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?author\.cover_image\s*?}}/g,
        helper: '{{author.cover_image}}'
    },
    'GS001-DEPR-AUTH-URL': {
        level: 'error',
        rule: 'Replace the <code>{{author.url}}</code> helper with <code>{{primary_author.url}}</code> or <code>{{authors.[#].url}}</code>',
        details: oneLineTrim`The usage of <code>{{author.url}}</code> is deprecated and should be replaced with either <code>{{primary_author.url}}</code>
        or <code>{{authors.[#].url}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?author\.url\s*?}}/g,
        helper: '{{author.url}}'
    },
    'GS001-DEPR-PAUTH': {
        level: 'error',
        rule: 'Replace the <code>{{post.author}}</code> helper with <code>{{post.primary_author}}</code> or <code>{{authors.[#]}}</code>',
        details: oneLineTrim`The usage of <code>{{post.author}}</code> is deprecated and should be replaced with either <code>{{post.primary_author}}</code>
        or <code>{{post.authors.[#]}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?post\.author\s*?}}/g,
        helper: '{{post.author}}'
    },
    'GS001-DEPR-PAUTH-ID': {
        level: 'error',
        rule: 'Replace the <code>{{post.author.id}}</code> helper with <code>{{post.primary_author.id}}</code> or <code>{{authors.[#].id}}</code>',
        details: oneLineTrim`The usage of <code>{{post.author.id}}</code> is deprecated and should be replaced with either <code>{{post.primary_author.id}}</code>
        or <code>{{post.authors.[#].id}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?post\.author\.id\s*?}}/g,
        helper: '{{post.author.id}}'
    },
    'GS001-DEPR-PAUTH-SLUG': {
        level: 'error',
        rule: 'Replace the <code>{{post.author.slug}}</code> helper with <code>{{post.primary_author.slug}}</code> or <code>{{post.authors.[#].slug}}</code>',
        details: oneLineTrim`The usage of <code>{{post.author.slug}}</code> is deprecated and should be replaced with either <code>{{post.primary_author.slug}}</code>
        or <code>{{post.authors.[#].slug}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?post\.author\.slug\s*?}}/g,
        helper: '{{post.author.slug}}'
    },
    'GS001-DEPR-PAUTH-MAIL': {
        level: 'error',
        rule: 'Replace the <code>{{post.author.email}}</code> helper with <code>{{post.primary_author.email}}</code> or <code>{{post.authors.[#].email}}</code>',
        details: oneLineTrim`The usage of <code>{{post.author.email}}</code> is deprecated and should be replaced with either <code>{{post.primary_author.email}}</code>
        or <code>{{post.authors.[#].email}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?post\.author\.email\s*?}}/g,
        helper: '{{post.author.email}}'
    },
    'GS001-DEPR-PAUTH-MT': {
        level: 'error',
        rule: 'Replace the <code>{{post.author.meta_title}}</code> helper with <code>{{post.primary_author.meta_title}}</code> or <code>{{post.authors.[#].meta_title}}</code>',
        details: oneLineTrim`The usage of <code>{{post.author.meta_title}}</code> is deprecated and should be replaced with either <code>{{post.primary_author.meta_title}}</code>
        or <code>{{post.authors.[#].meta_title}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?post\.author\.meta_title\s*?}}/g,
        helper: '{{post.author.meta_title}}'
    },
    'GS001-DEPR-PAUTH-MD': {
        level: 'error',
        rule: 'Replace the <code>{{post.author.meta_description}}</code> helper with <code>{{post.primary_author.meta_description}}</code> or <code>{{post.authors.[#].meta_description}}</code>',
        details: oneLineTrim`The usage of <code>{{post.author.meta_description}}</code> is deprecated and should be replaced with either <code>{{post.primary_author.meta_description}}</code>
        or <code>{{post.authors.[#].meta_description}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?post\.author\.meta_description\s*?}}/g,
        helper: '{{post.author.meta_description}}'
    },
    'GS001-DEPR-PAUTH-NAME': {
        level: 'error',
        rule: 'Replace the <code>{{post.author.name}}</code> helper with <code>{{post.primary_author.name}}</code> or <code>{{post.authors.[#].name}}</code>',
        details: oneLineTrim`The usage of <code>{{post.author.name}}</code> is deprecated and should be replaced with either <code>{{post.primary_author.name}}</code>
        or <code>{{post.authors.[#].name}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?post\.author\.name\s*?}}/g,
        helper: '{{post.author.name}}'
    },
    'GS001-DEPR-PAUTH-BIO': {
        level: 'error',
        rule: 'Replace the <code>{{post.author.bio}}</code> helper with <code>{{post.primary_author.bio}}</code> or <code>{{post.authors.[#].bio}}</code>',
        details: oneLineTrim`The usage of <code>{{post.author.bio}}</code> is deprecated and should be replaced with either <code>{{post.primary_author.bio}}</code>
        or <code>{{post.authors.[#].bio}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?post\.author\.bio\s*?}}/g,
        helper: '{{post.author.bio}}'
    },
    'GS001-DEPR-PAUTH-LOC': {
        level: 'error',
        rule: 'Replace the <code>{{post.author.location}}</code> helper with <code>{{post.primary_author.location}}</code> or <code>{{post.authors.[#].location}}</code>',
        details: oneLineTrim`The usage of <code>{{post.author.location}}</code> is deprecated and should be replaced with either <code>{{post.primary_author.location}}</code>
        or <code>{{post.authors.[#].location}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?post\.author\.location\s*?}}/g,
        helper: '{{post.author.location}}'
    },
    'GS001-DEPR-PAUTH-WEB': {
        level: 'error',
        rule: 'Replace the <code>{{post.author.website}}</code> helper with <code>{{post.primary_author.website}}</code> or <code>{{post.authors.[#].website}}</code>',
        details: oneLineTrim`The usage of <code>{{post.author.website}}</code> is deprecated and should be replaced with either <code>{{post.primary_author.website}}</code>
        or <code>{{post.authors.[#].website}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?post\.author\.website\s*?}}/g,
        helper: '{{post.author.website}}'
    },
    'GS001-DEPR-PAUTH-TW': {
        level: 'error',
        rule: 'Replace the <code>{{post.author.twitter}}</code> helper with <code>{{post.primary_author.twitter}}</code> or <code>{{post.authors.[#].twitter}}</code>',
        details: oneLineTrim`The usage of <code>{{post.author.twitter}}</code> is deprecated and should be replaced with either <code>{{post.primary_author.twitter}}</code>
        or <code>{{post.authors.[#].twitter}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?post\.author\.twitter\s*?}}/g,
        helper: '{{post.author.twitter}}'
    },
    'GS001-DEPR-PAUTH-FB': {
        level: 'error',
        rule: 'Replace the <code>{{post.author.facebook}}</code> helper with <code>{{post.primary_author.facebook}}</code> or <code>{{post.authors.[#].facebook}}</code>',
        details: oneLineTrim`The usage of <code>{{post.author.facebook}}</code> is deprecated and should be replaced with either <code>{{post.primary_author.facebook}}</code>
        or <code>{{post.authors.[#].facebook}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?post\.author\.facebook\s*?}}/g,
        helper: '{{post.author.facebook}}'
    },
    'GS001-DEPR-PAUTH-PIMG': {
        level: 'error',
        rule: 'Replace the <code>{{post.author.profile_image}}</code> helper with <code>{{post.primary_author.profile_image}}</code> or <code>{{post.authors.[#].profile_image}}</code>',
        details: oneLineTrim`The usage of <code>{{post.author.profile_image}}</code> is deprecated and should be replaced with either <code>{{post.primary_author.profile_image}}</code>
        or <code>{{post.authors.[#].profile_image}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?post\.author\.profile_image\s*?}}/g,
        helper: '{{post.author.profile_image}}'
    },
    'GS001-DEPR-PAUTH-CIMG': {
        level: 'error',
        rule: 'Replace the <code>{{post.author.cover_image}}</code> helper with <code>{{post.primary_author.cover_image}}</code> or <code>{{post.authors.[#].cover_image}}</code>',
        details: oneLineTrim`The usage of <code>{{post.author.cover_image}}</code> is deprecated and should be replaced with either <code>{{post.primary_author.cover_image}}</code>
        or <code>{{post.authors.[#].cover_image}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?post\.author\.cover_image\s*?}}/g,
        helper: '{{post.author.cover_image}}'
    },
    'GS001-DEPR-PAUTH-URL': {
        level: 'error',
        rule: 'Replace the <code>{{post.author.url}}</code> helper with <code>{{post.primary_author.url}}</code> or <code>{{post.authors.[#].url}}</code>',
        details: oneLineTrim`The usage of <code>{{post.author.url}}</code> is deprecated and should be replaced with either <code>{{post.primary_author.url}}</code>
        or <code>{{post.authors.[#].url}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?post\.author\.url\s*?}}/g,
        helper: '{{post.author.url}}'
    },
    'GS001-DEPR-PAID': {
        level: 'error',
        rule: 'Replace <code>{{post.author_id}}</code> code with <code>{{post.primary_author.id}}</code>',
        details: oneLineTrim`The <code>{{post.author_id}}</code> attribute in post context was removed<br>
        Instead of <code>{{post.author_id}}</code> you need to use <code>{{post.primary_author.id}}</code>.<br>
        See the object attributes of <code>post</code> <a href="${docsBaseUrl}context/post/#post-object-attributes" target=_blank>here</a>.`,
        regex: /{{\s*?post\.author_id\s*?}}/g,
        helper: '{{post.author_id}}'
    },
    'GS001-DEPR-NAUTH': {
        level: 'error',
        rule: 'Replace <code>../author</code> with <code>../primary_author</code> or <code>../authors.[#]</code>',
        details: oneLineTrim`The usage of <code>../author</code> is deprecated and should be replaced with either <code>../primary_author</code>
        or <code>../authors.[#]</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?(?:#|#if)?\s*?\.\.\/author(?:\.\S*?)?\s*?}}/g,
        helper: '{{../author}}'
    },
    'GS001-DEPR-IUA': {
        level: 'error',
        rule: 'Replace <code>{{img_url author.*}}</code> with <code>{{img_url primary_author.*}}</code> or <code>.{img_url author.[#].*}}</code>',
        details: oneLineTrim`The usage of <code>{{img_url author.*}}</code> is deprecated and should be replaced with either <code>{{img_url primary_author.*}}</code>
        or <code>{{img_url author.[#].*}}</code>.<br>
        Find more information about the <code>{{authors}}</code> helper <a href="${docsBaseUrl}helpers/authors/" target=_blank>here</a>.`,
        regex: /{{\s*?img_url\s*?(author.).*}}/g,
        helper: '{{img_url author.*}}'
    },
    'GS001-DEPR-BLOG': {
        level: 'error',
        rule: 'The <code>{{@blog}}</code> helper should be replaced with <code>{{@site}}</code>',
        details: oneLineTrim`With the introduction of the Content API <code>{{@blog}}</code> became deprecated in favour of <code>{{@site}}</code>.<br>
        The <code>{{@blog}}</code> helper will be removed in next version of Ghost and should not be used.
        Find more information about the <code>@site</code> property <a href="${docsBaseUrl}helpers/site/" target=_blank>here</a>.`,
        regex: /{{\s*?@blog\.[a-zA-Z0-9_]+\s*?}}/g,
        helper: '{{@blog}}'
    },
    'GS001-DEPR-BPL': {
        level: 'error',
        rule: '<code>{{@blog.permalinks}}</code> was removed',
        details: oneLineTrim`With the introduction of Dynamic Routing, you can define multiple permalinks.<br>
        The <code>{{@blog.permalinks}}</code> property will therefore no longer be used and should be removed from the theme.
        Find more information about Ghost data helpers <a href="${docsBaseUrl}/helpers/data/" target=_blank>here</a>.`,
        regex: /{{\s*?@blog\.permalinks\s*?}}/g,
        helper: '{{@blog.permalinks}}'
    },
    'GS001-DEPR-SPL': {
        level: 'error',
        rule: '<code>{{@site.permalinks}}</code> was removed',
        details: oneLineTrim`With the introduction of Dynamic Routing, you can define multiple permalinks.<br>
        The <code>{{@site.permalinks}}</code> property will therefore no longer be used and should be removed from the theme.
        Find more information about the <code>@site</code> property <a href="${docsBaseUrl}helpers/site/" target=_blank>here</a>.`,
        regex: /{{\s*?@site\.permalinks\s*?}}/g,
        helper: '{{@site.permalinks}}'
    },
    'GS001-DEPR-SGH': {
        level: 'error',
        rule: 'Replace <code>{{@site.ghost_head}}</code> with <code>{{ghost_head}}</code>',
        details: oneLineTrim`The usage of <code>{{@site.ghost_head}}</code> is deprecated and should be replaced with <code>{{ghost_head}}</code>.<br>
        The <code>{{@site.ghost_head}}</code> property will therefore no longer be used and should be removed from the theme.
        Find more information about the <code>{{ghost_head}}</code> property <a href="${docsBaseUrl}helpers/ghost_head_foot/" target=_blank>here</a>.`,
        regex: /{{\s*?@site\.ghost_head\s*?}}/g,
        helper: '{{@site.ghost_head}}'
    },
    'GS001-DEPR-SGF': {
        level: 'error',
        rule: 'Replace <code>{{@site.ghost_foot}}</code> with <code>{{ghost_foot}}</code>',
        details: oneLineTrim`The usage of <code>{{@site.ghost_foot}}</code> is deprecated and should be replaced with <code>{{ghost_foot}}</code>.<br>
        The <code>{{@site.ghost_foot}}</code> property will therefore no longer be used and should be removed from the theme.
        Find more information about the <code>{{ghost_foot}}</code> property <a href="${docsBaseUrl}helpers/ghost_head_foot/" target=_blank>here</a>.`,
        regex: /{{\s*?@site\.ghost_foot\s*?}}/g,
        helper: '{{@site.ghost_foot}}'
    },
    'GS001-DEPR-LANG': {
        level: 'error',
        rule: 'The <code>{{lang}}</code> helper should be replaced with <code>{{@site.lang}}</code>',
        details: oneLineTrim`The <code>{{lang}}</code> helper is a duplicate of <code>{{@site.lang}}</code>. Using <code>{{@site.lang}}</code> is preferred.<br>
        The <code>{{lang}}</code> helper will be removed in next version of Ghost and should not be used.
        Find more information about the <code>@site.lang</code> property <a href="${docsBaseUrl}helpers/site/" target=_blank>here</a>.`,
        regex: /{{\s*?lang\s*?}}/g,
        helper: '{{lang}}'
    },
    'GS001-DEPR-CSS-KGMD': {
        level: 'warning',
        rule: `<code>.kg-card-markdown</code> doesn't exist in current version of Ghost, ensure your theme works without it`,
        details: oneLineTrim`The <code>.kg-card-markdown</code> CSS class is deprecated and will no longer be used in Ghost.
        It's recommended to add your own wrapper around the <code>{{content}}</code> helper and target that instead if needed.
        Find out more about required theme changes for the Koenig editor <a href="${docsBaseUrl}editor/" target=_blank>here</a>.`,
        regex: /\.kg-card-markdown/g,
        className: '.kg-card-markdown',
        css: true
    },
    'GS050-CSS-KGWW': {
        level: 'error',
        rule: 'The <code>.kg-width-wide</code> CSS class is required to appear styled in your theme',
        details: oneLineTrim`The <code>.kg-width-wide</code> CSS class is required otherwise wide images will appear unstyled.
        Find out more about required theme changes for the Koenig editor <a href="${docsBaseUrl}editor/#image-size-implementations" target=_blank>here</a>.`,
        regex: /\.kg-width-wide/g,
        className: '.kg-width-wide',
        css: true
    },
    'GS050-CSS-KGWF': {
        level: 'error',
        rule: 'The <code>.kg-width-full</code> CSS class is required to appear styled in your theme',
        details: oneLineTrim`The <code>.kg-width-full</code> CSS class is required otherwise full width images will appear unstyled.
        Find out more about required theme changes for the Koenig editor <a href="${docsBaseUrl}editor/#image-size-implementations" target=_blank>here</a>.`,
        regex: /\.kg-width-full/g,
        className: '.kg-width-full',
        css: true
    },
    'GS050-CSS-KGGC': {
        level: 'error',
        rule: 'The <code>.kg-gallery-container</code> CSS class is required to appear styled in your theme',
        details: oneLineTrim`The <code>.kg-gallery-container</code> CSS class is required otherwise galleries will appear unstyled.
        Find out more about required theme changes for the Koenig editor <a href="${docsBaseUrl}editor/#gallery-card" target=_blank>here</a>.`,
        regex: /\.kg-gallery-container/g,
        className: '.kg-gallery-container',
        css: true
    },
    'GS050-CSS-KGGR': {
        level: 'error',
        rule: 'The <code>.kg-gallery-row</code> CSS class is required to appear styled in your theme',
        details: oneLineTrim`The <code>.kg-gallery-row</code> CSS class is required otherwise gallery rows will appear unstyled.
        Find out more about required theme changes for the Koenig editor <a href="${docsBaseUrl}editor/#gallery-card" target=_blank>here</a>.`,
        regex: /\.kg-gallery-row/g,
        className: '.kg-gallery-row',
        css: true
    },
    'GS050-CSS-KGGI': {
        level: 'error',
        rule: 'The <code>.kg-gallery-image</code> CSS class is required to appear styled in your theme',
        details: oneLineTrim`The <code>.kg-gallery-image</code> CSS class is required otherwise gallery images will appear unstyled.
        Find out more about required theme changes for the Koenig editor <a href="${docsBaseUrl}editor/#gallery-card" target=_blank>here</a>.`,
        regex: /\.kg-gallery-image/g,
        className: '.kg-gallery-image',
        css: true
    },
    'GS050-CSS-KGBM': {
        level: 'error',
        rule: 'The <code>.kg-bookmark-card</code> CSS class is required to appear styled in your theme',
        details: oneLineTrim`The <code>.kg-bookmark-card</code> CSS class is required otherwise the bookmark card will appear unstyled.
        Find out more about required theme changes for the Koenig editor <a href="${docsBaseUrl}editor/#bookmark-card" target=_blank>here</a>.`,
        regex: /\.kg-bookmark-card/g,
        className: '.kg-bookmark-card',
        css: true
    },
    'GS050-CSS-KGBMCO': {
        level: 'error',
        rule: 'The <code>.kg-bookmark-container</code> CSS class is required to appear styled in your theme',
        details: oneLineTrim`The <code>.kg-bookmark-card</code> CSS class is required otherwise the bookmark card will appear unstyled.
        Find out more about required theme changes for the Koenig editor <a href="${docsBaseUrl}editor/#bookmark-card" target=_blank>here</a>.`,
        regex: /\.kg-bookmark-container/g,
        className: '.kg-bookmark-container',
        css: true
    },
    'GS050-CSS-KGBMCON': {
        level: 'error',
        rule: 'The <code>.kg-bookmark-content</code> CSS class is required to appear styled in your theme',
        details: oneLineTrim`The <code>.kg-bookmark-content</code> CSS class is required otherwise the bookmark card main content will appear unstyled.
        Find out more about required theme changes for the Koenig editor <a href="${docsBaseUrl}editor/#bookmark-card" target=_blank>here</a>.`,
        regex: /\.kg-bookmark-content/g,
        className: '.kg-bookmark-content',
        css: true
    },
    'GS050-CSS-KGBMTI': {
        level: 'error',
        rule: 'The <code>.kg-bookmark-title</code> CSS class is required to appear styled in your theme',
        details: oneLineTrim`The <code>.kg-bookmark-title</code> CSS class is required otherwise the bookmark card title will appear unstyled.
        Find out more about required theme changes for the Koenig editor <a href="${docsBaseUrl}editor/#bookmark-card" target=_blank>here</a>.`,
        regex: /\.kg-bookmark-title/g,
        className: '.kg-bookmark-title',
        css: true
    },
    'GS050-CSS-KGBMDE': {
        level: 'error',
        rule: 'The <code>.kg-bookmark-description</code> CSS class is required to appear styled in your theme',
        details: oneLineTrim`The <code>.kg-bookmark-description</code> CSS class is required otherwise the bookmark card description will appear unstyled.
        Find out more about required theme changes for the Koenig editor <a href="${docsBaseUrl}editor/#bookmark-card" target=_blank>here</a>.`,
        regex: /\.kg-bookmark-description/g,
        className: '.kg-bookmark-description',
        css: true
    },
    'GS050-CSS-KGBMME': {
        level: 'error',
        rule: 'The <code>.kg-bookmark-metadata</code> CSS class is required to appear styled in your theme',
        details: oneLineTrim`The <code>.kg-bookmark-metadata</code> CSS class is required otherwise the bookmark card meta details will appear unstyled.
        Find out more about required theme changes for the Koenig editor <a href="${docsBaseUrl}editor/#bookmark-card" target=_blank>here</a>.`,
        regex: /\.kg-bookmark-metadata/g,
        className: '.kg-bookmark-metadata',
        css: true
    },
    'GS050-CSS-KGBMIC': {
        level: 'error',
        rule: 'The <code>.kg-bookmark-icon</code> CSS class is required to appear styled in your theme',
        details: oneLineTrim`The <code>.kg-bookmark-icon</code> CSS class is required otherwise the bookmark card author icon will appear unstyled.
        Find out more about required theme changes for the Koenig editor <a href="${docsBaseUrl}editor/#bookmark-card" target=_blank>here</a>.`,
        regex: /\.kg-bookmark-icon/g,
        className: '.kg-bookmark-icon',
        css: true
    },
    'GS050-CSS-KGBMAU': {
        level: 'error',
        rule: 'The <code>.kg-bookmark-author</code> CSS class is required to appear styled in your theme',
        details: oneLineTrim`The <code>.kg-bookmark-author</code> CSS class is required otherwise the bookmark card author name will appear unstyled.
        Find out more about required theme changes for the Koenig editor <a href="${docsBaseUrl}editor/#bookmark-card" target=_blank>here</a>.`,
        regex: /\.kg-bookmark-author/g,
        className: '.kg-bookmark-author',
        css: true
    },
    'GS050-CSS-KGBMPU': {
        level: 'error',
        rule: 'The <code>.kg-bookmark-publisher</code> CSS class is required to appear styled in your theme',
        details: oneLineTrim`The <code>.kg-bookmark-publisher</code> CSS class is required otherwise the bookmark card publisher name will appear unstyled.
        Find out more about required theme changes for the Koenig editor <a href="${docsBaseUrl}editor/#bookmark-card" target=_blank>here</a>.`,
        regex: /\.kg-bookmark-publisher/g,
        className: '.kg-bookmark-publisher',
        css: true
    },
    'GS050-CSS-KGBMTH': {
        level: 'error',
        rule: 'The <code>.kg-bookmark-thumbnail</code> CSS class is required to appear styled in your theme',
        details: oneLineTrim`The <code>.kg-bookmark-thumbnail</code> CSS class is required otherwise the bookmark card thumbnail image will appear unstyled.
        Find out more about required theme changes for the Koenig editor <a href="${docsBaseUrl}editor/#bookmark-card" target=_blank>here</a>.`,
        regex: /\.kg-bookmark-thumbnail/g,
        className: '.kg-bookmark-thumbnail',
        css: true
    },
    // Updated v1 rules
    'GS001-DEPR-AC': {
        rule: 'Replace the <code>{{author.cover}}</code> helper with <code>{{primary_author.cover_image}}</code>',
        details: oneLineTrim`The <code>cover</code> attribute was replaced with <code>cover_image</code>.<br>
        Instead of <code>{{author.cover}}</code> you need to use
        <code>{{primary_author.cover_image}}</code> or <code>{{authors.[#].cover_image}}</code>.<br>
        See the object attributes of <code>author</code> <a href="${docsBaseUrl}context/author/#author-object-attributes" target=_blank>here</a>.`,
        regex: /{{\s*?author\.cover\s*?}}/g,
        helper: '{{author.cover}}'
    },
    'GS001-DEPR-AC-2': {
        rule: 'Replace the <code>{{primary_author.cover}}</code> helper with <code>{{primary_author.cover_image}}</code>',
        details: oneLineTrim`The <code>cover</code> attribute was replaced with <code>cover_image</code>.<br>
        Instead of <code>{{primary_author.cover}}</code> you need to use
        <code>{{primary_author.cover_image}}</code>.<br>
        See the object attributes of <code>author</code> <a href="${docsBaseUrl}context/author/#author-object-attributes" target=_blank>here</a>.`,
        regex: /{{\s*?primary_author\.cover\s*?}}/g,
        helper: '{{primary_author.cover}}'
    },
    'GS001-DEPR-AC-3': {
        rule: 'Replace the <code>{{authors.[#].cover}}</code> helper with <code>{{authors.[#].cover_image}}</code>',
        details: oneLineTrim`The <code>cover</code> attribute was replaced with <code>cover_image</code>.<br>
        Instead of <code>{{authors.[#].cover}}</code> you need to use
        <code>{{authors.[#].cover_image}}</code>.<br>
        See the object attributes of <code>author</code> <a href="${docsBaseUrl}context/author/#author-object-attributes" target=_blank>here</a>.`,
        regex: /{{\s*?authors\.\[[0-9]+\]\.(cover)\s*?}}/g,
        helper: '{{authors.[#].cover}}'
    },

    'GS001-DEPR-AIMG': {
        rule: 'Replace the <code>{{author.image}}</code> helper with <code>{{primary_author.profile_image}}</code> or <code>{{authors.[#].profile_image}}</code>',
        details: oneLineTrim`The <code>image</code> attribute was replaced with <code>profile_image</code>.<br>
        Instead of <code>{{author.image}}</code>, you need to use
        <code>{{primary_author.profile_image}}</code> or <code>{{authors.[#].profile_image}}</code>.<br>
        See the object attributes of <code>author</code> <a href="${docsBaseUrl}context/author/#author-object-attributes" target=_blank>here</a>.`,
        regex: /{{\s*?author\.image\s*?}}/g,
        helper: '{{author.image}}'
    },
    'GS001-DEPR-AIMG-2': {
        rule: 'Replace the <code>{{primary_author.image}}</code> helper with <code>{{primary_author.profile_image}}</code>',
        details: oneLineTrim`The <code>image</code> attribute was replaced with <code>profile_image</code>.<br>
        Instead of <code>{{primary_author.image}}</code>, you need to use
        <code>{{primary_author.profile_image}}</code>.<br>
        See the object attributes of <code>author</code> <a href="${docsBaseUrl}context/author/#author-object-attributes" target=_blank>here</a>.`,
        regex: /{{\s*?primary_author\.(image)\s*?}}/g,
        helper: '{{primary_author.image}}'
    },
    'GS001-DEPR-AIMG-3': {
        rule: 'Replace the <code>{{authors.[#].image}}</code> helper with <code>{{authors.[#].profile_image}}</code>',
        details: oneLineTrim`The <code>image</code> attribute was replaced with <code>profile_image</code>.<br>
        Instead of <code>{{authors.[#].image}}</code>, you need to use
        <code>{{authors.[#].profile_image}}</code>.<br>
        See the object attributes of <code>author</code> <a href="${docsBaseUrl}context/author/#author-object-attributes" target=_blank>here</a>.`,
        regex: /{{\s*?authors\.\[[0-9]+\]\.(cover)\s*?}}/g,
        helper: '{{authors.[#].image}}'
    },

    'GS001-DEPR-PAC': {
        rule: 'Replace the <code>{{post.author.cover}}</code> helper with <code>{{post.primary_author.cover_image}}</code> or <code>{{post.authors.[#].cover_image}}</code>',
        details: oneLineTrim`The <code>cover</code> attribute was replaced with <code>cover_image</code>.<br>
        Instead of <code>{{post.author.cover}}</code>, you need to use
        <code>{{post.primary_author.cover_image}}</code> or <code>{{post.authors.[#].cover_image}}</code>.<br>
        See the object attributes of <code>author</code> <a href="${docsBaseUrl}context/author/#author-object-attributes" target=_blank>here</a>.`,
        regex: /{{\s*?post\.author\.cover\s*?}}/g,
        helper: '{{post.author.cover}}'
    },
    'GS001-DEPR-PAC-2': {
        rule: 'Replace the <code>{{post.primary_author.cover}}</code> helper with <code>{{post.primary_author.cover_image}}</code>',
        details: oneLineTrim`The <code>cover</code> attribute was replaced with <code>cover_image</code>.<br>
        Instead of <code>{{post.primary_author.cover}}</code>, you need to use
        <code>{{post.primary_author.cover_image}}</code>.<br>
        See the object attributes of <code>author</code> <a href="${docsBaseUrl}context/author/#author-object-attributes" target=_blank>here</a>.`,
        regex: /{{\s*?post\.primary_author\.cover\s*?}}/g,
        helper: '{{post.primary_author.cover}}'
    },
    'GS001-DEPR-PAC-3': {
        rule: 'Replace the <code>{{post.authors.[#].cover}}</code> helper with <code>{{post.authors.[#].cover_image}}</code>',
        details: oneLineTrim`The <code>cover</code> attribute was replaced with <code>cover_image</code>.<br>
        Instead of <code>{{post.authors.[#].cover}}</code>, you need to use
        <code>{{post.authors.[#].cover_image}}</code>.<br>
        See the object attributes of <code>author</code> <a href="${docsBaseUrl}context/author/#author-object-attributes" target=_blank>here</a>.`,
        regex: /{{\s*?post\.authors\.\[[0-9]+\]\.(cover)\s*?}}/g,
        helper: '{{post.authors.[#].cover}}'
    },

    'GS001-DEPR-PAIMG': {
        rule: 'Replace the <code>{{post.author.image}}</code> helper with <code>{{post.primary_author.profile_image}}</code> or <code>{{post.authors.[#].profile_image}}</code>',
        details: oneLineTrim`The <code>image</code> attribute was replaced with <code>profile_image</code>.<br>
        Instead of <code>{{post.author.image}}</code>, you need to use
        <code>{{post.primary_author.profile_image}}</code> or <code>{{post.authors.[#].profile_image}}</code>.<br>
        See the object attributes of <code>author</code> <a href="${docsBaseUrl}context/author/#author-object-attributes" target=_blank>here</a>.`,
        regex: /{{\s*?post\.author\.image\s*?}}/g,
        helper: '{{post.author.image}}'
    },
    'GS001-DEPR-PAIMG-2': {
        rule: 'Replace the <code>{{post.primary_author.image}}</code> helper with <code>{{post.primary_author.profile_image}}</code>',
        details: oneLineTrim`The <code>image</code> attribute was replaced with <code>profile_image</code>.<br>
        Instead of <code>{{post.primary_author.image}}</code>, you need to use
        <code>{{post.primary_author.profile_image}}</code>.<br>
        See the object attributes of <code>author</code> <a href="${docsBaseUrl}context/author/#author-object-attributes" target=_blank>here</a>.`,
        regex: /{{\s*?post\.primary_author\.image\s*?}}/g,
        helper: '{{post.primary_author.image}}'
    },
    'GS001-DEPR-PAIMG-3': {
        rule: 'Replace the <code>{{post.authors.[#].image}}</code> helper with <code>{{post.authors.[#].profile_image}}</code>',
        details: oneLineTrim`The <code>image</code> attribute was replaced with <code>profile_image</code>.<br>
        Instead of <code>{{post.authors.[#].image}}</code>, you need to use
        <code>{{post.authors.[#].profile_image}}</code>.<br>
        See the object attributes of <code>author</code> <a href="${docsBaseUrl}context/author/#author-object-attributes" target=_blank>here</a>.`,
        regex: /{{\s*?post\.authors\.\[[0-9]+\]\.(image)\s*?}}/g,
        helper: '{{post.authors.[#].image}}'
    },

    'GS001-DEPR-CON-AC': {
        rule: 'Replace the <code>{{#if author.cover}}</code> helper with <code>{{#if primary_author.cover_image}}</code> or <code>{{#if authors.[#].cover_image}}</code>',
        details: oneLineTrim`The <code>cover</code> attribute was replaced with <code>cover_image</code>.<br>
        Instead of <code>{{#if author.cover}}</code>, you need to use
        <code>{{#if primary_author.cover_image}}</code> or <code>{{#if authors.[#].cover_image}}</code>.<br>
        See the object attributes of <code>author</code> <a href="${docsBaseUrl}context/author/#author-object-attributes" target=_blank>here</a>.`,
        regex: /{{\s*?#if\s*?author\.cover\s*?}}/g,
        helper: '{{#if author.cover}}'
    },

    'GS001-DEPR-CON-AC-2': {
        rule: 'Replace the <code>{{#if primary_author.cover}}</code> helper with <code>{{#if primary_author.cover_image}}</code>',
        details: oneLineTrim`The <code>cover</code> attribute was replaced with <code>cover_image</code>.<br>
        Instead of <code>{{#if primary_author.cover}}</code>, you need to use
        <code>{{#if primary_author.cover_image}}</code>.<br>
        See the object attributes of <code>author</code> <a href="${docsBaseUrl}context/author/#author-object-attributes" target=_blank>here</a>.`,
        regex: /{{\s*?#if\s*?primary_author\.cover\s*?}}/g,
        helper: '{{#if primary_author.cover}}'
    },

    'GS001-DEPR-CON-AC-3': {
        rule: 'Replace the <code>{{#if authors.[#].cover}}</code> helper with <code>{{#if authors.[#].cover_image}}</code>',
        details: oneLineTrim`The <code>cover</code> attribute was replaced with <code>cover_image</code>.<br>
        Instead of <code>{{#if authors.[#].cover}}</code>, you need to use
        <code>{{#if authors.[#].cover_image}}</code>.<br>
        See the object attributes of <code>author</code> <a href="${docsBaseUrl}context/author/#author-object-attributes" target=_blank>here</a>.`,
        regex: /{{\s*?#if\s*?authors\.\[[0-9]+\]\.cover\s*?}}/g,
        helper: '{{#if authors.[#].cover}}'
    },

    'GS001-DEPR-CON-AIMG': {
        rule: 'Replace the <code>{{#if author.image}}</code> helper with <code>{{#if primary_author.profile_image}}</code> or <code>{{#if authors.[#].profile_image}}</code>',
        details: oneLineTrim`The <code>image</code> attribute was replaced with <code>profile_image</code>.<br>
        Instead of <code>{{#if author.image}}</code>, you need to use
        <code>{{#if primary_author.profile_image}}</code> or <code>{{#if authors.[#].profile_image}}</code>.<br>
        See the object attributes of <code>author</code> <a href="${docsBaseUrl}context/author/#author-object-attributes" target=_blank>here</a>.`,
        regex: /{{\s*?#if\s*?author\.image\s*?}}/g,
        helper: '{{#if author.image}}'
    },
    'GS001-DEPR-CON-AIMG-2': {
        rule: 'Replace the <code>{{#if primary_author.image}}</code> helper with <code>{{#if primary_author.profile_image}}</code>',
        details: oneLineTrim`The <code>image</code> attribute was replaced with <code>profile_image</code>.<br>
        Instead of <code>{{#if primary_author.image}}</code>, you need to use
        <code>{{#if primary_author.profile_image}}</code>.<br>
        See the object attributes of <code>author</code> <a href="${docsBaseUrl}context/author/#author-object-attributes" target=_blank>here</a>.`,
        regex: /{{\s*?#if\s*?primary_author\.image\s*?}}/g,
        helper: '{{#if primary_author.image}}'
    },
    'GS001-DEPR-CON-AIMG-3': {
        rule: 'Replace the <code>{{#if authors.[#].image}}</code> helper with <code>{{#if authors.[#].profile_image}}</code>',
        details: oneLineTrim`The <code>image</code> attribute was replaced with <code>profile_image</code>.<br>
        Instead of <code>{{#if authors.[#].image}}</code>, you need to use
        <code>{{#if authors.[#].profile_image}}</code>.<br>
        See the object attributes of <code>author</code> <a href="${docsBaseUrl}context/author/#author-object-attributes" target=_blank>here</a>.`,
        regex: /{{\s*?#if\s*?authors\.\[[0-9]+\]\.image\s*?}}/g,
        helper: '{{#if authors.[#].image}}'
    },

    'GS001-DEPR-CON-PAC': {
        rule: 'Replace the <code>{{#if post.author.cover}}</code> helper with <code>{{#if post.primary_author.cover_image}}</code> or <code>{{#if post.authors.[#].cover_image}}</code>',
        details: oneLineTrim`The <code>cover</code> attribute was replaced with <code>cover_image</code>.<br>
        Instead of <code>{{#if post.author.cover}}</code>, you need to use
        <code>{{#if post.primary_author.cover_image}}</code> or <code>{{#if post.authors.[#].cover_image}}</code>.<br>
        See the object attributes of <code>author</code> <a href="${docsBaseUrl}context/author/#author-object-attributes" target=_blank>here</a>.`,
        regex: /{{\s*?#if\s*?post\.author\.cover\s*?}}/g,
        helper: '{{#if post.author.cover}}'
    },
    'GS001-DEPR-CON-PAC-2': {
        rule: 'Replace the <code>{{#if post.primary_author.cover}}</code> helper with <code>{{#if post.primary_author.cover_image}}</code>',
        details: oneLineTrim`The <code>cover</code> attribute was replaced with <code>cover_image</code>.<br>
        Instead of <code>{{#if post.primary_author.cover}}</code>, you need to use
        <code>{{#if post.primary_author.cover_image}}</code>.<br>
        See the object attributes of <code>author</code> <a href="${docsBaseUrl}context/author/#author-object-attributes" target=_blank>here</a>.`,
        regex: /{{\s*?#if\s*?post\.primary_author\.cover\s*?}}/g,
        helper: '{{#if post.primary_author.cover}}'
    },
    'GS001-DEPR-CON-PAC-3': {
        rule: 'Replace the <code>{{#if post.authors.[#].cover}}</code> helper with <code>{{#if post.authors.[#].cover_image}}</code>',
        details: oneLineTrim`The <code>cover</code> attribute was replaced with <code>cover_image</code>.<br>
        Instead of <code>{{#if post.authors.[#].cover}}</code>, you need to use
        <code>{{#if post.authors.[#].cover_image}}</code>.<br>
        See the object attributes of <code>author</code> <a href="${docsBaseUrl}context/author/#author-object-attributes" target=_blank>here</a>.`,
        regex: /{{\s*?#if\s*?post\.authors\.\[[0-9]+\]\.cover\s*?}}/g,
        helper: '{{#if post.authors.[#].cover}}'
    },

    'GS001-DEPR-CON-PAIMG': {
        rule: 'Replace the <code>{{#if post.author.image}}</code> helper with <code>{{#if post.primary_author.profile_image}}</code> or <code>{{#if post.authors.[#].profile_image}}</code>',
        details: oneLineTrim`The <code>image</code> attribute was replaced with <code>profile_image</code>.<br>
        Instead of <code>{{#if post.author.image}}</code>, you need to use
        <code>{{#if post.primary_author.profile_image}}</code> or <code>{{#if post.authors.[#].profile_image}}</code>.<br>
        See the object attributes of <code>author</code> <a href="${docsBaseUrl}context/author/#author-object-attributes" target=_blank>here</a>.`,
        regex: /{{\s*?#if\s*?post\.author\.image\s*?}}/g,
        helper: '{{#if post.author.image}}'
    },
    'GS001-DEPR-CON-PAIMG-2': {
        rule: 'Replace the <code>{{#if post.primary_author.image}}</code> helper with <code>{{#if post.primary_author.profile_image}}</code>',
        details: oneLineTrim`The <code>image</code> attribute was replaced with <code>profile_image</code>.<br>
        Instead of <code>{{#if post.primary_author.image}}</code>, you need to use
        <code>{{#if post.primary_author.profile_image}}</code>.<br>
        See the object attributes of <code>author</code> <a href="${docsBaseUrl}context/author/#author-object-attributes" target=_blank>here</a>.`,
        regex: /{{\s*?#if\s*?post\.primary_author\.image\s*?}}/g,
        helper: '{{#if post.primary_author.image}}'
    },
    'GS001-DEPR-CON-PAIMG-3': {
        rule: 'Replace the <code>{{#if post.authors.[#].image}}</code> helper with <code>{{#if post.authors.[#].profile_image}}</code>',
        details: oneLineTrim`The <code>image</code> attribute was replaced with <code>profile_image</code>.<br>
        Instead of <code>{{#if post.authors.[#].image}}</code>, you need to use
        <code>{{#if post.authors.[#].profile_image}}</code>.<br>
        See the object attributes of <code>author</code> <a href="${docsBaseUrl}context/author/#author-object-attributes" target=_blank>here</a>.`,
        regex: /{{\s*?#if\s*?post\.authors\.\[[0-9]+\]\.image\s*?}}/g,
        helper: '{{#if post.authors.[#].image}}'
    },

    'GS010-PJ-KEYWORDS': {
        level: 'warning',
        rule: '<code>package.json</code> property <code>keywords</code> should contain <code>ghost-theme</code>',
        details: oneLineTrim`The property <code>keywords</code> in your <code>package.json</code> file must contain <code>ghost-theme</code>. E.g. <code>{"keywords": ["ghost-theme"]}</code>.<br>
        Check the <a href="${docsBaseUrl}packagejson/" target=_blank><code>package.json</code> documentation</a> for further information.`
    }
};

knownHelpers = _.union(previousKnownHelpers, knownHelpers);
templates = _.union(previousTemplates, templates);

// Merge the previous rules into the new rules, but overwrite any specified property,
// as well as adding any new rule to the spec.
// Furthermore, replace the usage of the old doc URLs that we're linking to, with the
// new version.
rules = _.each(_.merge({}, previousRules, rules), function replaceDocsUrl(value) {
    value.details = value.details.replace(prevDocsBaseUrlRegEx, docsBaseUrl);
});

module.exports = {
    knownHelpers: knownHelpers,
    templates: templates,
    rules: rules
};
