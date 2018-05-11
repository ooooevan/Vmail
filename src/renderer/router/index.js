import Vue from 'vue'
import Router from 'vue-router'
import letter from '@/pages/letter'
import inboxMail from '@/pages/inbox-mail'
import starMail from '@/pages/star-mail'
import draftsMail from '@/pages/drafts-mail'
import sentMail from '@/pages/sent-mail'
import writeMail from '@/pages/write'
import mailDetails from '@/pages/mail-details'
import addressList from '@/pages/address-list'

import notfind from '@/pages/notfind'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/letter'
      // component: letter
    },
    {
      path: '/letter',
      redirect: '/letter/inbox',
      component: letter,
      children: [
        {
          path: 'inbox',
          component: inboxMail
        },
        {
          path: 'star',
          component: starMail
        },
        {
          path: 'drafts',
          component: draftsMail
        },
        {
          path: 'sent',
          component: sentMail
        },
        {
          path: 'write',
          redirect: '/write'
        }
      ]
    },
    {
      path: '/mailDetails/:id',
      component: mailDetails
    },
    {
      path: '/write',
      component: writeMail
    },
    {
      path: '/addressList',
      component: addressList
    },
    {
      path: '*',
      // redirect: '/',
      component: notfind
    }
  ]
})
