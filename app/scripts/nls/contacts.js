define([], function() {
'use strict';
return {
    root: {
        BUTTONS:{
            'newContact' : 'New contact',
            'deselect' : 'Deselect',
            'delete' : 'Delete',
            'addNewItem' : 'Add new item',
            'edit' : 'Edit',
            'save' : 'Save',
            'cancel' : 'Cancel'
        },
        NO_CONTACT_TIPS : 'No contacts matched your search.',
        NO_CONTACT : 'No contacts on your phone. Your friends are waiting!',
        NO_NAME : 'No Name',
        LOAD_MORE : 'Load more',
        WORDS : {
            'account' : 'Account',
            'nameOrganization' : 'Name & Organization',
            'phone' : 'Phone',
            'email' : 'E-mail',
            'address' : 'Address',
            'IM' : 'IM',
            'website' : 'Website',
            'relationship' : 'Relationship',
            'note' : 'Note'
        },
        TYPE_MAP:{
             'address' : {
                 'CA_CUSTOM':'Custom',
                 'CA_HOME':'Home',
                 'CA_WORK':'Work',
                 'CA_OTHER':'Other'
              },
             'event' : {
                 'CE_ANNIVERSARY' :'Anniversary', //周年纪念日
                 'CE_OTHER' :'Other',
                 'CE_BIRTHDAY' :'Birthday'
              },
             'nickname' : {
                 'CN_DEFAULT' :'Default',
                 'CN_OTHER_NAME' :'Other name',
                 'CN_MAINDEN_NAME' :'Mainden name',
                 'CN_SHORT_NAME' :'Short name',
                 'CN_INITIALS' :'Initials'  //首字母、缩写
              },
             'organization' : {
                 'CO_CUSTOM':'Custom',
                 'CO_WORK':'Work',
                 'CO_OTHER':'Other'
              },
             'website' : {
                 'CW_HOMEPAGE':'Homepage',
                 'CW_BLOG':'Blog',
                 'CW_PROFILE':'Profile',
                 'CW_HOME':'Home',
                 'CW_WORK':'Work',
                 'CW_FTP':'FTP',
                 'CW_OTHER':'Other'
              },
             'IM' : {
                 'CI_TYPE_CUSTOM':'Custom',
                 'CI_HOME':'Home',
                 'CI_WORK':'Work',
                 'CI_OTHER':'Other'
              },
             'relation' : {
                  //'CR_CUSTOM' : 'Custom',
                 'CR_ASSISTANT':'Assistant',
                 'CR_BROTHER':'Brother',
                 'CR_CHILD':'Child',
                 'CR_DOMESTIC_PARTNER':'Partner',
                 'CR_FATHER':'Father',
                 'CR_FRIEND':'Friend',
                 'CR_MANAGER':'Manager',
                 'CR_MOTHER':'Mother',
                 'CR_PARENT':'Parent',
                 'CR_PARTNER':'Partner',
                 'CR_REFERRED_BY':'Referred by',
                 'CR_RELATIVE':'Relative',
                 'CR_SISTER':'Sister',
                 'CR_SPOUSE':'Spouse'
              },
             'phone' : {
                 'CP_CUSTOM':'Custom',
                 'CP_HOME':'Home',
                 'CP_MOBILE':'Mobile',
                 'CP_WORK':'Work',
                 'CP_FAX_WORK':'Fax Work',
                 'CP_FAX_HOME':'Fax Home',
                 'CP_PAGER':'Pager',
                 'CP_OTHER':'Other',
                 'CP_CALLBACK':'Callback',
                 'CP_CAR':'Car',
                 'CP_COMPANY_MAIN':'Company main',
                 'CP_ISDN':'ISDN',
                 'CP_MAIN':'Main',
                 'CP_OTHER_FAX':'Other Fax',
                 'CP_RADIO':'Radio',
                 'CP_TELEX':'Telex',
                 'CP_TTY_TDD':'TTY TDD',
                 'CP_WORK_MOBILE':'Work Mobile',
                 'CP_WORK_PAGER':'Work Pager',
                 'CP_ASSISTANT':'Assistant',
                 'CP_MMS':'MMS'
              },
             'email' : {
                 'CE_CUSTOM':'Custom',
                 'CE_HOME':'Home',
                 'CE_WORK':'Work',
                 'CE_OTHER':'Other',
                 'CE_MOBILE':'Mobile'
              },

              //原本没有的
              'note' : {
                  'Default' : 'Default'
              }
          },
          IM_PROTOCOL : {
              'CI_PROTOCOL_CUSTOM':'Custom',
              'CI_AIM':'AIM',
              'CI_MSN':'MSN',
              'CI_YAHOO':'Yahoo',
              'CI_SKYPE':'Skype',
              'CI_QQ':'QQ',
              'CI_GOOGLE_TALK':'Gtalk',
              'CI_ICQ':'ICQ',
              'CI_JABBER':'Jabber',
              'CI_NETMEETING': 'Netmeeting'
          }
    }
};
});
