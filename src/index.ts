import {s} from "vitest/dist/reporters-w_64AS5f";
import {ActiveVote, AffiliateCodes, App, ExposedFieldCounter, Field, OptionsMap, Wobject} from "./interfaces";
import {
    ADMIN_ROLES,
    ARRAY_FIELDS,
    FIELDS_NAMES,
    MIN_PERCENT_TO_SHOW_UPDATE,
    SHOP_SETTINGS_TYPE,
    VOTE_STATUSES,
    categorySwitcher,
    INDEPENDENT_FIELDS,
    LANGUAGES_POPULARITY,
    FULL_SINGLE_FIELDS, OBJECT_TYPES, REQUIREDFIELDS_PARENT, LIST_TYPES,
} from "./constants";
import * as _ from "lodash";
import {jsonHelper} from "./helpers";
import {makeAffiliateLinks} from "./makeAffiliateLinks";
import {EXPOSED_FIELDS_FOR_OBJECT_TYPE} from "./exposedFields";


export interface FindParentsByPermlinkFn {
    (permlinks: string[]): Promise<Wobject[]>;
}

export interface GetWaivioAdminsAndOwnerFn {
    (): Promise<string[]>;
}

export interface GetBlacklistFn {
    (admins: string[]): Promise<string[]>;
}

export interface GetObjectsByGroupIdFn {
    (ids: string[]): Promise<Wobject[]>;
}

export interface ProcessorOptions {
    findParentsByPermlink: FindParentsByPermlinkFn
    getWaivioAdminsAndOwner: GetWaivioAdminsAndOwnerFn
    getBlacklist: GetBlacklistFn
    getObjectsByGroupId: GetObjectsByGroupIdFn
    masterAccount: string
}

interface GetAssignedAdmins {
    admins: string[]
    ownership: string[]
    administrative: string[]
    blacklist: string[]
    owner: string
    object: Wobject
}

interface AddDataToFields {
    fields: Field[]
    filter: string[]
    admins: string[]
    ownership: string[]
    administrative: string[]
    blacklist: string[]
    owner: string
    isOwnershipObj: boolean
}

interface AddAdminVote {
    field: Field
    ownership: string[]
    administrative: string[]
    admins: string[]
    owner: string
    isOwnershipObj: boolean
}

interface ArrayFieldFilter {
    idFields: Field[]
    allFields: object
    filter: string[]
    id: string
}

interface ListItemsPick {
    listItems: Field[],
    locale: string
    index: string
}

interface ArrayFieldPush {
    filter?: string[]
    field: Field
}

interface SetWinningFields {
    id: string,
    winningField: Field,
    winningFields: object,
}

interface AddOptions {
    object: Wobject,
    ownership: string[],
    admins: string[],
    administrative: string[],
    owner: string
    blacklist: string[],
    locale: string
}

interface GetParentInfo {
    locale: string,
    app: App,
    parent: Wobject,
}

interface ProcessWobjects {
    wobjects: Wobject[],
    fields: string [],
    hiveData?: boolean,
    locale: string,
    app: App,
    returnArray?: boolean,
    topTagsLimit?: number,
    countryCode?: string,
    reqUserName?: string,
    affiliateCodes?: AffiliateCodes[],
    mobile?: boolean,
}

export class ObjectProcessor {
    private readonly findParentsByPermlink: FindParentsByPermlinkFn;
    private readonly getWaivioAdminsAndOwner: GetWaivioAdminsAndOwnerFn;
    private readonly getBlacklist: GetBlacklistFn;
    private readonly getObjectsByGroupId: GetObjectsByGroupIdFn;
    private readonly masterAccount: string;

    constructor(options: ProcessorOptions = {} as ProcessorOptions) {
        this.findParentsByPermlink = options.findParentsByPermlink
        this.getWaivioAdminsAndOwner = options.getWaivioAdminsAndOwner
        this.getBlacklist = options.getBlacklist
        this.getObjectsByGroupId = options.getObjectsByGroupId
        this.masterAccount = options.masterAccount
    }

    private arrayFieldPush({
                               filter = [],
                               field,
                           }: ArrayFieldPush) {
        if (_.includes(filter, FIELDS_NAMES.GALLERY_ALBUM)) return false;
        if (_.get(field, 'adminVote.status') === VOTE_STATUSES.APPROVED) return true;

        return (field.weight > 0 && (field.approvePercent || 0) > MIN_PERCENT_TO_SHOW_UPDATE);
    };

    private setWinningFields = ({id, winningField, winningFields}: SetWinningFields) => {
        winningFields[id] = this.getSingleFieldsDisplay(winningField);

        if (id === FIELDS_NAMES.DESCRIPTION) {
            // @ts-ignore
            winningFields.descriptionCreator = winningField.creator;
        }
    };

    private getSingleFieldsDisplay(field: Field) {
        if (!field) return;
        if (FULL_SINGLE_FIELDS.includes(field.name)) return field;
        return field.body;
    };

    private specialFieldFilter(idField: Field, allFields: object, id: string) {
        if (!idField.adminVote && idField.weight < 0) return null;
        idField.items = [];
        const filteredItems = _.filter(
            allFields[categorySwitcher[id]]
            (item)
    =>
        item.id === idField.id && _.get(item, 'adminVote.status') !== VOTE_STATUSES.REJECTED
    )
        ;

        for (const itemField of filteredItems) {
            if (!idField.adminVote && itemField.weight < 0) continue;
            idField.items.push(itemField);
        }
        return idField;
    };

    private arrayFieldFilter({
                                 idFields,
                                 allFields,
                                 filter,
                                 id,
                             }: ArrayFieldFilter) {
        const validFields = [];
        for (const field of idFields) {
            if (_.get(field, 'adminVote.status') === VOTE_STATUSES.REJECTED) continue;
            switch (id) {
                case FIELDS_NAMES.TAG_CATEGORY:
                case FIELDS_NAMES.GALLERY_ALBUM:
                    validFields.push(this.specialFieldFilter(field, allFields, id));
                    break;
                case FIELDS_NAMES.RATING:
                case FIELDS_NAMES.PHONE:
                case FIELDS_NAMES.BUTTON:
                case FIELDS_NAMES.BLOG:
                case FIELDS_NAMES.FORM:
                case FIELDS_NAMES.GALLERY_ITEM:
                case FIELDS_NAMES.LIST_ITEM:
                case FIELDS_NAMES.NEWS_FILTER:
                case FIELDS_NAMES.COMPANY_ID:
                case FIELDS_NAMES.PRODUCT_ID:
                case FIELDS_NAMES.OPTIONS:
                case FIELDS_NAMES.AUTHORS:
                case FIELDS_NAMES.DEPARTMENTS:
                case FIELDS_NAMES.FEATURES:
                case FIELDS_NAMES.AUTHORITY:
                case FIELDS_NAMES.PIN:
                case FIELDS_NAMES.MENU_ITEM:
                case FIELDS_NAMES.ADD_ON:
                case FIELDS_NAMES.RELATED:
                case FIELDS_NAMES.SIMILAR:
                case FIELDS_NAMES.WALLET_ADDRESS:
                case FIELDS_NAMES.DELEGATION:
                case FIELDS_NAMES.PROMOTION:
                    if (this.arrayFieldPush({
                        filter,
                        field,
                    })) {
                        validFields.push(field);
                    }
                    break;
                case FIELDS_NAMES.GROUP_ID:
                case FIELDS_NAMES.REMOVE:
                case FIELDS_NAMES.AFFILIATE_GEO_AREA:
                case FIELDS_NAMES.AFFILIATE_PRODUCT_ID_TYPES:
                case FIELDS_NAMES.GROUP_ADD:
                case FIELDS_NAMES.GROUP_EXCLUDE:
                    if (this.arrayFieldPush({
                        filter,
                        field,
                    })) {
                        validFields.push(field.body);
                    }
                    break;
                default:
                    break;
            }
        }
        const result = _.compact(validFields);

        if (id === FIELDS_NAMES.DEPARTMENTS) {
            if (result.length > 10) {
                const sorted = _.orderBy(result, ['weight'], ['desc']);
                return {
                    result: _.take(sorted, 10),
                    id,
                };
            }
        }

        return {
            result,
            id,
        };
    };

    private filterAssignedAdmin(admins: string[], field: Field): boolean {
        return (field.name === FIELDS_NAMES.DELEGATION
            && admins.includes(field.creator));
    }

    private listItemsPick({listItems, locale, index}: ListItemsPick) {
        const result = [];
        const groupedItems = index === FIELDS_NAMES.LIST_ITEM
            ? _.groupBy(listItems, 'body')
            : _.groupBy(listItems.map((el) => {
                const parsedLink = jsonHelper.parseJson(el.body);
                const groupField = parsedLink?.linkToObject
                    ? `${parsedLink?.linkToObject}${parsedLink?.style}`
                    : `${parsedLink?.linkToWeb}${parsedLink?.style}`;
                return {
                    ...el,
                    groupField,
                };
            }), 'groupField');

        for (const item in groupedItems) {
            const ourLocale = groupedItems[item]
                .find((el) => this.arrayFieldPush({field: el}) && el.locale === locale);
            if (ourLocale) {
                result.push(ourLocale);
                continue;
            }
            if (locale !== 'en-US') {
                const enLocale = groupedItems[item]
                    .find((el) => this.arrayFieldPush({field: el}) && el.locale === 'en-US');
                if (enLocale) {
                    result.push(enLocale);
                    continue;
                }
            }
            const maxWeightLocale = _.maxBy(groupedItems[item]
                .filter((el) => this.arrayFieldPush({field: el})), 'weight');
            if (maxWeightLocale) result.push(maxWeightLocale);
        }

        return result;
    };

    private getLangByPopularity = (existedLanguages: string[]) => {
        const filtered = _.filter(
            LANGUAGES_POPULARITY,
            (l) => _.includes(existedLanguages, l.lang),
        );
        const found = _.minBy(filtered, 'score');
        if (!found) return 'en-US';
        return found.lang;
    };

    private filterFieldValidation(filter: string[], field: Field, locale: string, ownership: string []) {
        if (field.locale === 'auto') field.locale = 'en-US';

        let result = _.includes(INDEPENDENT_FIELDS, field.name) || locale === field.locale;
        if (filter) result = result && _.includes(filter, field.name);
        if (ownership?.length) {
            result = (result && _.includes([ADMIN_ROLES.OWNERSHIP, ADMIN_ROLES.ADMIN, ADMIN_ROLES.OWNER, ADMIN_ROLES.MASTER], _.get(field, 'adminVote.role')))
                || (result && _.includes(ownership, field?.creator));
        }
        return result;
    };

    private getFilteredFields(fields: Field[], locale: string, filter: string[], ownership: string[]) {
        const fieldsLanguages = [];

        const fieldTypes = _.reduce(fields, (acc, el) => {
            const conditionLocale = _.get(el, 'adminVote.status') === VOTE_STATUSES.APPROVED
                || el.weight > 0;

            if (_.has(acc, `${el.name}`)) {
                const locales = _.find(fieldsLanguages, (l) => l.type === el.name);
                if (!locales && conditionLocale) {
                    fieldsLanguages.push({
                        type: el.name,
                        languages: [el.locale],
                    });
                }
                if (locales && !_.includes(locales.languages, el.locale) && conditionLocale) {
                    locales.languages.push(el.locale);
                }

                acc[el.name].push(el);
                return acc;
            }
            if (conditionLocale) {
                fieldsLanguages.push({
                    type: el.name,
                    languages: [el.locale],
                });
            }
            acc[el.name] = [el];
            return acc;
        }, {});

        return _.reduce(fieldTypes, (acc, el, index) => {
            if ([FIELDS_NAMES.LIST_ITEM, FIELDS_NAMES.MENU_ITEM].includes(index)) {
                const items = this.listItemsPick({listItems: el, locale, index});
                acc = [...acc, ...items];
                return acc;
            }

            const fieldLanguage = _.find(fieldsLanguages, (l) => l.type === index);
            const existedLanguages = _.get(fieldLanguage, 'languages', []);

            const nativeLang = _.filter(
                el,
                (field) => this.filterFieldValidation(filter, field, locale, ownership)
                    && _.includes(existedLanguages, field.locale),
            );

            if (_.isEmpty(nativeLang)) {
                acc = [
                    ...acc,
                    ..._.filter(el, (field) => this.filterFieldValidation(
                        filter,
                        field,
                        this.getLangByPopularity(existedLanguages),
                        ownership,
                    ))];
                return acc;
            }
            acc = [...acc, ...nativeLang];
            return acc;
        }, []);
    };

    private getFieldsToDisplay = (fields: Field[], locale: string, filter: string[], permlink: string, ownership: string[]) => {
        locale = locale === 'auto' ? 'en-US' : locale;
        const winningFields = {};
        const filteredFields = this.getFilteredFields(fields, locale, filter, ownership);

        if (!filteredFields.length) return {};

        const groupedFields = _.groupBy(filteredFields, 'name');
        for (const id of Object.keys(groupedFields)) {
            const approvedFields = _.filter(
                groupedFields[id],
                (field) => _.get(field, 'adminVote.status') === VOTE_STATUSES.APPROVED,
            );

            if (_.includes(ARRAY_FIELDS, id)) {
                const {
                    result,
                    id: newId,
                } = this.arrayFieldFilter({
                    idFields: groupedFields[id],
                    allFields: groupedFields,
                    filter,
                    id,
                });
                if (result.length) winningFields[newId] = result;
                continue;
            }
            // pick from admin fields
            if (approvedFields.length) {
                const rolesPriority = [ADMIN_ROLES.MASTER, ADMIN_ROLES.OWNER, ADMIN_ROLES.ADMIN];

                const winningField = rolesPriority.reduce((winning, role) => {
                    if (winning) return winning;
                    const roleVotes = _.filter(approvedFields, (field) => field.adminVote.role === role);
                    return _.maxBy(roleVotes, 'adminVote.timestamp') || winning;
                }, null) || _.maxBy(approvedFields, 'adminVote.timestamp');

                if (winningField) {
                    winningFields[id] = this.getSingleFieldsDisplay(winningField);
                    this.setWinningFields({id, winningFields, winningField});
                }
                continue;
            }
            // pick from heaviest field
            const winningField = _.maxBy(groupedFields[id], (field) => {
                if (_.get(field, 'adminVote.status') !== 'rejected' && field.weight > 0
                    && field.approvePercent > MIN_PERCENT_TO_SHOW_UPDATE) {
                    return field.weight;
                }
            });
            if (winningField) this.setWinningFields({id, winningFields, winningField});
        }
        return winningFields;
    };

    getExposedFields(objectType: string, fields: Field[]): ExposedFieldCounter[] {
        const exposedMap = new Map(
            EXPOSED_FIELDS_FOR_OBJECT_TYPE[objectType as keyof typeof EXPOSED_FIELDS_FOR_OBJECT_TYPE]
                .map((el) => [el, 0]),
        );
        if (exposedMap.has(FIELDS_NAMES.LIST_ITEM)) exposedMap.set(LIST_TYPES.MENU_PAGE, 0);

        for (const field of fields) {
            const value = exposedMap.get(field.name);

            if (field.name === FIELDS_NAMES.LIST_ITEM && field.type === LIST_TYPES.MENU_PAGE) {
                const listValue = exposedMap.get(field.type);
                exposedMap.set(field.type, (listValue || 0) + 1);
                continue;
            }
            if (value !== undefined) exposedMap.set(field.name, value + 1);
        }

        const exposedFieldsWithCounters = Array.from(exposedMap, ([name, value]) => ({
            name,
            value,
        }));
        exposedMap.clear();
        return exposedFieldsWithCounters;
    };

    private calculateApprovePercent(field: Field): number {
        if (field.adminVote) return field.adminVote.status === VOTE_STATUSES.APPROVED ? 100 : 0;
        if (field.weight <= 0) return 0;

        const rejectsWeight = _.sumBy(field.active_votes, (vote) => {
            if (vote.percent < 0) {
                return -(+vote.weight || -1);
            }
        }) || 0;
        const approvesWeight = _.sumBy(field.active_votes, (vote) => {
            if (vote.percent > 0) {
                return +vote.weight || 1;
            }
        }) || 0;
        if (!rejectsWeight) return 100;
        const percent = _.round((approvesWeight / (approvesWeight + rejectsWeight)) * 100, 3);
        return percent > 0 ? percent : 0;
    };

    private getFieldVoteRole(vote: ActiveVote) {
        let role = ADMIN_ROLES.ADMIN;
        if (vote.ownership) role = ADMIN_ROLES.OWNERSHIP;
        if (vote.administrative) role = ADMIN_ROLES.ADMINISTRATIVE;
        if (vote.owner) role = ADMIN_ROLES.OWNER;
        if (vote.master) role = ADMIN_ROLES.MASTER;

        return role;
    };

    private addAdminVote({
                             field, owner, admins, administrative, isOwnershipObj, ownership,
                         }: AddAdminVote) {
        let adminVote, administrativeVote, ownershipVote, ownerVote, masterVote;
        _.forEach(field.active_votes, (vote) => {
            vote.timestamp = vote._id
                ? vote._id.getTimestamp().valueOf()
                : Date.now();
            if (vote.voter === this.masterAccount) {
                vote.master = true;
                masterVote = vote;
            } else if (vote.voter === owner) {
                vote.owner = true;
                ownerVote = vote;
            } else if (_.includes(admins, vote.voter)) {
                vote.admin = true;
                if (vote.timestamp > _.get(adminVote, 'timestamp', 0)) adminVote = vote;
            } else if (_.includes(administrative, vote.voter)) {
                vote.administrative = true;
                if (vote.timestamp > _.get(administrativeVote, 'timestamp', 0)) administrativeVote = vote;
            } else if (isOwnershipObj && _.includes(ownership, vote.voter)) {
                vote.ownership = true;
                if (vote.timestamp > _.get(ownershipVote, 'timestamp', 0)) ownershipVote = vote;
            }
        });

        /** If field includes admin votes fill in it */
        if (masterVote || ownerVote || adminVote || administrativeVote || ownershipVote) {
            const mainVote = masterVote || ownerVote || adminVote || ownershipVote || administrativeVote;
            if (mainVote?.percent !== 0) {
                return {
                    role: this.getFieldVoteRole(mainVote as unknown as ActiveVote),
                    status: mainVote?.percent > 0 ? VOTE_STATUSES.APPROVED : VOTE_STATUSES.REJECTED,
                    name: mainVote?.voter,
                    timestamp: mainVote?.timestamp,
                };
            }
        }
    };

    private getOwnerAndAdmins = (app: App) => {
        let owner = app?.owner || '';
        const admins = app?.admins ?? [];
        /** if owner add himself to admins means that he has same rights on object as admins */
        if (admins.includes(owner)) {
            owner = '';
        }

        return {owner, admins};
    };

    private addDataToFields({
                                fields,
                                filter,
                                admins,
                                ownership,
                                administrative,
                                isOwnershipObj,
                                owner,
                                blacklist = [],
                            }: AddDataToFields): Field[] {
        /** Filter, if we need not all fields */
        if (filter) fields = _.filter(fields, (field) => _.includes(filter, field.name));

        for (const field of fields) {
            // recount field weight and filter votes if black list not empty
            field.weight += (field?.weightWAIV ?? 0);
            if (
                !_.isEmpty(blacklist)
                && !_.isEmpty(field.active_votes)
                && field.name !== FIELDS_NAMES.AUTHORITY
                && _.some(field.active_votes, (v) => _.includes(blacklist, v.voter))
            ) {
                field.active_votes = _.filter(field.active_votes, (o) => !_.includes(blacklist, o.voter));
                const weightHive = _.sumBy(field.active_votes, (vote) => vote.weight) || 0;
                const weightWaiv = _.sumBy(field.active_votes, (vote) => vote.weightWAIV) || 0;
                field.weight = weightHive + weightWaiv;
            }
            if (_.has(field, '_id')) field.createdAt = field._id.getTimestamp().valueOf();

            const adminVote = this.addAdminVote({
                field, owner, admins, administrative, isOwnershipObj, ownership,
            });
            if (adminVote) field.adminVote = adminVote;
            field.approvePercent = this.calculateApprovePercent(field);
        }
        return fields;
    };

    private getAssignedAdmins({
                                  admins = [],
                                  owner,
                                  object,
                                  ownership,
                                  administrative,
                                  blacklist,
                              }: GetAssignedAdmins) {
        let fields = object?.fields?.filter((f) => this.filterAssignedAdmin([...admins, owner], f));
        if (!fields?.length) return [];

        fields = this.addDataToFields({
            isOwnershipObj: !!ownership.length,
            fields,
            filter: [FIELDS_NAMES.DELEGATION],
            admins,
            ownership,
            administrative,
            owner,
            blacklist,
        });

        const processed = this.getFieldsToDisplay(
            fields,
            'en-US',
            [FIELDS_NAMES.DELEGATION],
            object.author_permlink,
            ownership,
        );

        if (!processed[FIELDS_NAMES.DELEGATION]) return [];

        return processed[FIELDS_NAMES.DELEGATION].map((el) => el.body);
    };

    private findFieldByBody(fields: Field[], body: string) {
        return _.find(fields, (f) => f.body === body);
    }

    private groupOptions(options, obj?: Wobject): OptionsMap {
        return _.chain(options)
            .map((option) => ({
                ...option,
                body: jsonHelper.parseJson(option.body),
                ...(obj && {
                    author_permlink: obj.author_permlink,
                    price: obj.price,
                    avatar: obj.avatar,
                }),
            }))
            .groupBy(
                (option) => _.get(option, 'body.category'),
            )
            .value();
    }

    private async addOptions({
                                 object,
                                 ownership,
                                 admins,
                                 administrative,
                                 owner,
                                 blacklist,
                                 locale,
                             }: AddOptions) {
        const filter = [
            FIELDS_NAMES.GROUP_ID,
            FIELDS_NAMES.OPTIONS,
            FIELDS_NAMES.PRICE,
            FIELDS_NAMES.AVATAR,
        ];

        const wobjects = await this.getObjectsByGroupId(object.groupId || [])

        const options = _.reduce(wobjects, (acc, el) => {
            el.fields = this.addDataToFields({
                isOwnershipObj: !!ownership.length,
                fields: _.compact(el.fields),
                filter,
                admins,
                ownership,
                administrative,
                owner,
                blacklist,
            });
            Object.assign(
                el,
                this.getFieldsToDisplay(el.fields, locale, filter, el.author_permlink, ownership),
            );

            const conditionToAdd = el.groupId
                && _.some(el.groupId, (gId) => _.includes(object.groupId, gId))
                && !_.isEmpty(el.options);

            if (conditionToAdd) {
                acc.push(..._.map(el.options, (opt) => ({
                    ...opt,
                    author_permlink: el.author_permlink,
                    price: el.price,
                    avatar: el.avatar,
                })));
            }
            return acc;
        }, []);

        return this.groupOptions(options);
    };


    async getParentInfo({
                            locale,
                            app,
                            parent,
                        }: GetParentInfo) {

        if (!parent) return '';


        return this.processWobjects({
            locale,
            fields: REQUIREDFIELDS_PARENT,
            wobjects: [_.omit(parent, 'parent')],
            returnArray: false,
            app,
        });

    };

    getLinkFromMenuItem(mainObjectPermlink: string, menu: Field): string {
        const defaultLink = `/object/${mainObjectPermlink}`;
        const body = jsonHelper.parseJson(menu.body, null);
        if (!body) return defaultLink;
        if (!body.linkToObject) return defaultLink;
        const links = {
            [OBJECT_TYPES.LIST]: `/menu#${body.linkToObject}`,
            [OBJECT_TYPES.PAGE]: `/page#${body.linkToObject}`,
            [OBJECT_TYPES.NEWS_FEED]: `/newsfeed/${body.linkToObject}`,
            [OBJECT_TYPES.WIDGET]: `/widget#${body.linkToObject}`,
            default: '',
        };

        const linkEnding = links[body.objectType] || links.default;

        return `${defaultLink}${linkEnding}`;
    };

    getCustomSortLink(obj: Wobject): string {
        if (obj.object_type === OBJECT_TYPES.LIST) return `/object/${obj.author_permlink}/list`;
        const defaultLink = `/object/${obj.author_permlink}`;

        const menu = _.find(obj?.menuItem, (el) => el.permlink === _.get(obj, 'sortCustom.include[0]'));
        if (menu) {
            return this.getLinkFromMenuItem(obj.author_permlink, menu);
        }

        const field = _.find(_.get(obj, 'listItem', []), {body: _.get(obj, 'sortCustom.include[0]')});
        const blog = _.find(_.get(obj, 'blog', []), (el) => el.permlink === _.get(obj, 'sortCustom.include[0]'));
        const news = _.find(_.get(obj, 'newsFilter', []), (el) => el.permlink === _.get(obj, 'sortCustom.include[0]'));
        if (field) return `/object/${obj.author_permlink}/${field.type === 'menuPage' ? 'page' : 'menu'}#${field.body}`;
        if (blog) return `/object/${obj.author_permlink}/blog/@${blog.body}`;
        if (news) return `/object/${obj.author_permlink}/newsFilter/${news.permlink}`;

        return defaultLink;
    };


    getDefaultLink(obj: Wobject) {
        const defaultLink = `/object/${obj.author_permlink}`;
        const menu = _.find(obj?.menuItem, (el) => el.name === FIELDS_NAMES.MENU_ITEM);
        if (menu) return this.getLinkFromMenuItem(obj.author_permlink, menu);

        let listItem = _.get(obj, 'listItem', []);
        if (listItem.length) {
            if (_.find(listItem, (list) => list.type === 'menuList')) {
                listItem = _.filter(listItem, (list) => list.type === 'menuList');
            }

            const item = _
                .chain(listItem)
                .orderBy([(list) => _.get(list, 'adminVote.timestamp', 0), 'weight'], ['desc', 'desc'])
                .first()
                .value();
            return `/object/${obj.author_permlink}/${item.type === 'menuPage' ? 'page' : 'menu'}#${item.body}`;
        }
        if (_.get(obj, 'newsFilter', []).length) return `/object/${obj.author_permlink}/newsFilter/${obj?.newsFilter?.[0].permlink}`;
        if (_.get(obj, 'blog', []).length) return `/object/${obj.author_permlink}/blog/@${obj?.blog?.[0].body}`;

        return defaultLink;
    };


    getLinkToPageLoad(obj: Wobject, mobile?: boolean) {
        if (mobile) {
            return obj.object_type === OBJECT_TYPES.HASHTAG
                ? `/object/${obj.author_permlink}`
                : `/object/${obj.author_permlink}/about`;
        }
        if (_.get(obj, 'sortCustom.include', []).length) return this.getCustomSortLink(obj);

        switch (obj.object_type) {
            case OBJECT_TYPES.PAGE:
                return `/object/${obj.author_permlink}/page`;
            case OBJECT_TYPES.LIST:
                return `/object/${obj.author_permlink}/list`;
            case OBJECT_TYPES.BUSINESS:
            case OBJECT_TYPES.PRODUCT:
            case OBJECT_TYPES.SERVICE:
            case OBJECT_TYPES.COMPANY:
            case OBJECT_TYPES.PERSON:
            case OBJECT_TYPES.PLACE:
            case OBJECT_TYPES.HOTEL:
            case OBJECT_TYPES.RESTAURANT:
                return this.getDefaultLink(obj);
            case OBJECT_TYPES.WIDGET:
                return `/object/${obj.author_permlink}/widget`;
            case OBJECT_TYPES.NEWS_FEED:
                return `/object/${obj.author_permlink}/newsfeed`;
            case OBJECT_TYPES.SHOP:
                return `/object/${obj.author_permlink}/shop`;
            case OBJECT_TYPES.WEB_PAGE:
                return `/object/${obj.author_permlink}/webpage`;
            case OBJECT_TYPES.MAP:
                return `/object/${obj.author_permlink}/map`;
            case OBJECT_TYPES.GROUP:
                return `/object/${obj.author_permlink}/group`;
            default:
                return `/object/${obj.author_permlink}`;
        }
    };


    getTopTags(obj: Wobject, limit = 2): string [] {
        const tagCategories = _.get(obj, 'tagCategory', []);
        if (_.isEmpty(tagCategories)) return [];
        let tags: string[] = [];
        for (const tagCategory of tagCategories) {
            // @ts-ignore
            tags = _.concat(tags, tagCategory.items);
        }

        return _
            .chain(tags)
            .orderBy('weight', 'desc')
            .slice(0, limit)
            .map('body')
            .value();
    };


    async processWobjects({
                              wobjects,
                              fields,
                              hiveData = false,
                              locale = 'en-US',
                              app,
                              returnArray = true,
                              topTagsLimit,
                              countryCode = '',
                              reqUserName,
                              affiliateCodes = [],
                              mobile
                          }: ProcessWobjects): Promise<Wobject[] | Wobject> {

        const filteredWobj: Wobject[] = [];
        if (!_.isArray(wobjects)) return filteredWobj;
        let parents: Wobject[] = [];
        const parentPermlinks = _.chain(wobjects)
            .map('parent')
            .compact()
            .uniq()
            .value();

        if (parentPermlinks.length) {
            parents = await this.findParentsByPermlink(parentPermlinks);
        }

        const {owner, admins} = this.getOwnerAndAdmins(app);
        /** Get waivio admins and owner */
        const waivioAdmins = await this.getWaivioAdminsAndOwner();
        const blacklist = await this.getBlacklist(_.uniq([owner, ...admins, ...waivioAdmins]));
        // means that owner want's all objects on sites behave like ownership objects
        const objectControl = !!app?.objectControl;
        const userShop = app?.configuration?.shopSettings?.type === SHOP_SETTINGS_TYPE.USER;
        const extraAuthority = userShop
            ? app?.configuration?.shopSettings?.value
            : app?.owner;

        for (let obj of wobjects) {
            let exposedFields: ExposedFieldCounter[] = [];
            obj.parent = '';
            if (obj.newsFilter) obj = _.omit(obj, ['newsFilter']);

            /** Get app admins, wobj administrators, which was approved by app owner(creator) */
            const ownership = _.intersection(_.get(obj, 'authority.ownership', []), _.get(app, 'authority', []));
            const administrative = _.intersection(_.get(obj, 'authority.administrative', []), _.get(app, 'authority', []));

            // get admins that can be assigned by owner or other admins
            const assignedAdmins = this.getAssignedAdmins({
                admins, ownership, administrative, owner, blacklist, object: obj,
            });
            const objectAdmins = [...admins, ...assignedAdmins];

            if (objectControl
                && (!_.isEmpty(administrative)
                    || !_.isEmpty(ownership)
                    || _.get(obj, 'authority.administrative', []).includes(extraAuthority)
                    || _.get(obj, 'authority.ownership', []).includes(extraAuthority)
                )
            ) {
                ownership.push(extraAuthority, ...objectAdmins);
            }

            /** If flag hiveData exists - fill in wobj fields with hive data */
            if (hiveData) exposedFields = this.getExposedFields(obj.object_type, obj.fields);


            obj.fields = this.addDataToFields({
                isOwnershipObj: !!ownership.length,
                fields: _.compact(obj.fields),
                filter: fields,
                admins: objectAdmins,
                ownership,
                administrative,
                owner,
                blacklist,
            });
            /** Omit map, because wobject has field map, temp solution? maybe field map in wobj not need */
            obj = _.omit(obj, ['map', 'search']);
            obj = {
                ...obj,
                ...this.getFieldsToDisplay(obj.fields, locale, fields, obj.author_permlink, ownership),
            };

            /** Get right count of photos in object in request for only one object */
            if (!fields) {
                obj.albums_count = _.get(obj, FIELDS_NAMES.GALLERY_ALBUM, []).length;
                obj.photos_count = _.get(obj, FIELDS_NAMES.GALLERY_ITEM, []).length;
                obj.preview_gallery = _.orderBy(_.get(obj, FIELDS_NAMES.GALLERY_ITEM, []), ['weight'], ['desc']);
                if (obj.avatar) {
                    obj.preview_gallery.unshift({
                        ...this.findFieldByBody(obj.fields, obj.avatar),
                        id: obj.author_permlink,
                    });
                }
                if (obj.options || obj.groupId) {
                    obj.options = obj.groupId
                        ? await this.addOptions({
                            object: obj,
                            ownership,
                            admins: objectAdmins,
                            administrative,
                            owner,
                            blacklist,
                            locale,
                        })
                        : this.groupOptions(obj.options, obj);
                }
            }

            if ((obj.options || obj.groupId) && _.includes(fields, FIELDS_NAMES.OPTIONS)) {
                obj.options = obj.groupId
                    ? await this.addOptions({
                        object: obj,
                        ownership,
                        admins: objectAdmins,
                        administrative,
                        owner,
                        blacklist,
                        locale,
                    })
                    : this.groupOptions(obj.options, obj);
            }

            if (obj.sortCustom) obj.sortCustom = JSON.parse(obj.sortCustom as string);
            if (obj.newsFilter) {
                obj.newsFilter = _.map(obj.newsFilter, (item) => _.pick(item, ['title', 'permlink', 'name']));
            }
            if (_.isString(obj.parent)) {
                const parent = _.find(parents, {author_permlink: obj.parent});
                obj.parent = await this.getParentInfo({
                    locale,
                    app,
                    parent: parent as Wobject,
                });
            }
            if (obj.productId && obj.object_type !== OBJECT_TYPES.PERSON && affiliateCodes.length) {
                obj.affiliateLinks = makeAffiliateLinks({
                    affiliateCodes,
                    productIds: obj.productId,
                    countryCode,
                });
            }
            if (obj.departments && typeof obj.departments[0] === 'string') {
                obj.departments = null;
            }
            obj.defaultShowLink = this.getLinkToPageLoad(obj, mobile);
            obj.exposedFields = exposedFields;

            // @ts-ignore
            obj.authority = _.find(
                obj.authority,
                (a: Field) => a.creator === reqUserName && a.body === 'administrative',
            );
            if (!hiveData) obj = _.omit(obj, ['fields', 'latest_posts', 'last_posts_counts_by_hours', 'tagCategories', 'children']);
            if (_.has(obj, FIELDS_NAMES.TAG_CATEGORY)) obj.topTags = this.getTopTags(obj, topTagsLimit);
            filteredWobj.push(obj);
        }
        if (!returnArray) return filteredWobj[0];
        return filteredWobj;
    }

}

export default ObjectProcessor;
