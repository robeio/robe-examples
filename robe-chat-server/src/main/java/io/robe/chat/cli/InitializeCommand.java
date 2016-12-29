package io.robe.chat.cli;

import io.dropwizard.Application;
import io.robe.admin.hibernate.entity.Menu;
import io.robe.admin.hibernate.entity.Role;
import io.robe.admin.hibernate.entity.Service;
import io.robe.admin.hibernate.entity.User;
import io.robe.chat.ChatConfiguration;
import io.robe.guice.GuiceBundle;
import io.robe.hibernate.RobeHibernateBundle;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Criterion;
import org.hibernate.criterion.Restrictions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import java.util.List;

public class InitializeCommand extends io.robe.admin.cli.InitializeCommand<ChatConfiguration> {

    private static final Logger LOGGER = LoggerFactory.getLogger(InitializeCommand.class);

    @Inject
    protected RobeHibernateBundle hibernateBundle;

    public InitializeCommand(Application<ChatConfiguration> service, String name, String description) {
        super(service, name, description);
        GuiceBundle.getInjector()
                .injectMembers(this);
        setHibernateBundle(hibernateBundle);
    }


    @Override
    public void execute(ChatConfiguration configuration) {
        super.execute(configuration);

        LOGGER.info("----- Opening session -----");
        final Session session = hibernateBundle.getSessionFactory()
                .openSession();

        Menu root = (Menu) session.createCriteria(Menu.class)
                .add(Restrictions.eq("path", "root"))
                .uniqueResult();

        Role adminRole = (Role) session.createCriteria(Role.class)
                .add(Restrictions.eq("code", "io/robe/admin"))
                .uniqueResult();

        Role userRole = (Role) session.createCriteria(Role.class)
                .add(Restrictions.eq("code", "user"))
                .uniqueResult();

        User userAdmin = (User) session.createCriteria(User.class).add(Restrictions.eq("email", EMAIL)).uniqueResult();
        userAdmin.setName("Super");
        userAdmin.setSurname("Admin");


        LOGGER.info("----- Creating menu -----");

        Menu chat = new Menu();
        chat.setPath("Chat");
        chat.setIndex(1);
        chat.setText("Mesajlaşma");
        chat.setParentOid(root.getOid());
        chat.setIcon("fa-firefox");
        chat.setModule("Chat");
        session.persist(chat);
        session.persist(createPermission(true, chat.getOid(), adminRole));
        session.persist(createPermission(true, chat.getOid(), userRole));

        Menu sample = new Menu();
        sample.setModule("ChatSample");
        sample.setText("Chat Sample");
        sample.setPath("app/chat/ChatSample");
        sample.setIndex(1);
        sample.setParentOid(chat.getOid());
        sample.setIcon("fa fa-user-secret");
        session.persist(sample);
        session.persist(createPermission(true, sample.getOid(), adminRole));
        session.persist(createPermission(true, sample.getOid(), userRole));

        /**
         * Sample user
         */
        User user1 = new User();
        user1.setRoleOid(userRole.getOid());
        user1.setActive(true);
        user1.setEmail("recep.koseoglu@mebitech.com");
        user1.setName("Recep");
        user1.setSurname("Köseoğlu");
        user1.setPassword("96cae35ce8a9b0244178bf28e4966c2ce1b8385723a96a6b838858cdd6ca0a1e");
        session.persist(user1);

        User user2 = new User();
        user2.setRoleOid(userRole.getOid());
        user2.setActive(true);
        user2.setEmail("seray.uzgur@mebitech.com");
        user2.setName("Seray");
        user2.setSurname("Uzgur");
        user2.setPassword("96cae35ce8a9b0244178bf28e4966c2ce1b8385723a96a6b838858cdd6ca0a1e");
        session.persist(user2);

        User user3 = new User();
        user3.setRoleOid(userRole.getOid());
        user3.setActive(true);
        user3.setEmail("hasan.mumin@mebitech.com");
        user3.setName("Hasan");
        user3.setSurname("Mümin");
        user3.setPassword("96cae35ce8a9b0244178bf28e4966c2ce1b8385723a96a6b838858cdd6ca0a1e");
        session.persist(user3);


        Criteria criteria = session.createCriteria(Service.class);

        Criterion gMessage = Restrictions.eq("group", "Message");
        Criterion gUser = Restrictions.eq("group", "User");
        Criterion mProfile = Restrictions.and(Restrictions.eq("method", Service.Method.GET), Restrictions.eq("path", "/authentication/profile"));

        criteria.add(Restrictions.or(gMessage, gUser, mProfile));

        List<Service> serviceList = criteria.list();

        for (Service service : serviceList) {
            session.persist(createPermission(false, service.getOid(), userRole));
        }

        session.flush();
        session.close();

        LOGGER.info("----- Initialize finished -----");


    }
}
