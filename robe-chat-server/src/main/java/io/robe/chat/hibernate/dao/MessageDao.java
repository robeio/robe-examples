package io.robe.chat.hibernate.dao;

import io.robe.chat.hibernate.entity.Message;
import io.robe.common.service.search.model.SearchModel;
import io.robe.hibernate.dao.BaseDao;
import org.hibernate.Criteria;
import org.hibernate.SessionFactory;
import org.hibernate.criterion.Criterion;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Restrictions;

import javax.inject.Inject;
import java.util.List;

public class MessageDao extends BaseDao<Message> {

    @Inject
    public MessageDao(SessionFactory sessionFactory) {
        super(sessionFactory);
    }

    public List<Message> getAllMessages(String ownerOid, String receiverOid, SearchModel search) {
        Criteria criteria = criteria();
        Criterion rest1 = Restrictions.and(
                Restrictions.eq("ownerOid", ownerOid),
                Restrictions.eq("receiverOid", receiverOid));
        Criterion rest2 = Restrictions.and(
                Restrictions.eq("ownerOid", receiverOid),
                Restrictions.eq("receiverOid", ownerOid));
        criteria.add(Restrictions.or(rest1, rest2));
        criteria.addOrder(Order.desc("creationDate"));
        criteria.setMaxResults(search.getLimit());
        return list(criteria);
    }

    public List<Message> unreadMessages(String ownerOid, String receiverOid) {
        Criteria criteria = super.criteria();
        criteria.add(Restrictions.and(
                Restrictions.eq("ownerOid", ownerOid),
                Restrictions.eq("receiverOid", receiverOid)));
        criteria.add(Restrictions.eq("readingStatus", false));
        return list(criteria);
    }

    public Long unreadCount(String ownerOid, String receiverOid) {
        Criteria criteria = super.criteria();
        criteria.add(Restrictions.and(
                Restrictions.eq("ownerOid", ownerOid),
                Restrictions.eq("receiverOid", receiverOid)));
        criteria.add(Restrictions.eq("readingStatus", false));
        return ((Long) criteria.setProjection(Projections.rowCount()).uniqueResult()).longValue();
    }

    public Long unreadCountByReceiverId(String userOid) {
        Criteria criteria = super.criteria();
        criteria.add(Restrictions.eq("receiverOid", userOid));
        criteria.add(Restrictions.eq("readingStatus", false));
        return ((Long) criteria.setProjection(Projections.rowCount()).uniqueResult()).longValue();
    }
}
