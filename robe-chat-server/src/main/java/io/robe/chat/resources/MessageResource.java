package io.robe.chat.resources;

import io.dropwizard.hibernate.UnitOfWork;
import io.dropwizard.jersey.PATCH;
import io.robe.admin.hibernate.dao.UserDao;
import io.robe.admin.hibernate.entity.User;
import io.robe.auth.Credentials;
import io.robe.auth.RobeAuth;
import io.robe.chat.hibernate.dao.MessageDao;
import io.robe.chat.hibernate.entity.Message;
import io.robe.common.exception.RobeRuntimeException;
import io.robe.common.service.RobeService;
import io.robe.common.service.search.SearchParam;
import io.robe.common.service.search.model.SearchModel;
import io.robe.websocket.Packet;
import io.robe.websocket.WebSocket;
import org.hibernate.CacheMode;
import org.hibernate.FlushMode;

import javax.inject.Inject;
import javax.validation.Valid;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.util.*;

import static org.hibernate.CacheMode.GET;

@Path("messages")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class MessageResource {

    @Inject
    private MessageDao messageDao;

    @Inject
    private UserDao userDao;

    /**
     * Returns all {@link Message}s as a collection.
     *
     * @param credentials injected by {@link RobeAuth} annotation for authentication.
     * @return all {@link Message}s as a collection with.
     */

    @RobeService(group = "Message", description = "Returns all Messages as a collection.")
    @GET
    @UnitOfWork(readOnly = true, cacheMode = CacheMode.GET, flushMode = FlushMode.MANUAL)
    public List<Message> getAll(@RobeAuth Credentials credentials, @SearchParam SearchModel search) {
        return messageDao.findAllStrict(search);
    }

    /**
     * Returns a single Message matches with the given id.
     * <p>
     * Status Code:
     * Not Found  404
     *
     * @param credentials injected by {@link RobeAuth} annotation for authentication.
     * @param id          This is the oid of {@link Message}
     * @return a {@link Message} resource matches with the given id.
     */
    @RobeService(group = "Message", description = "Returns a Message resource matches with the given id.")
    @Path("{id}")
    @GET
    @UnitOfWork(readOnly = true, cacheMode = CacheMode.GET, flushMode = FlushMode.MANUAL)
    public Message get(@RobeAuth Credentials credentials, @PathParam("id") String id) {
        Message entity = messageDao.findById(id);
        if (entity == null) {
            throw new WebApplicationException(Response.status(404).build());
        }
        return entity;
    }

    /**
     * Create as a {@link Message} resource.
     *
     * @param credentials injected by {@link RobeAuth} annotation for authentication.
     * @param model       data of {@link Message}
     * @return Create as a {@link Message} resource.
     */
    @RobeService(group = "Message", description = "Message as a User resource.")
    @POST
    @UnitOfWork
    public Message create(@RobeAuth Credentials credentials, @Valid Message model) {
        model.setCreationDate(new Date());
        Message message = messageDao.create(model);

        User owner = userDao.findById(credentials.getUserId());
        User receiver = userDao.findById(message.getReceiverOid());
        if (receiver == null)
            throw new RobeRuntimeException("HATA", "Kullanıcı bulunamadı!");

        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        response.put("owner", owner);

        try {
            WebSocket.sendText(new Packet(Packet.Type.MESSAGE, receiver.getOid(), response));
        } catch (IOException e) {
//            e.printStackTrace();
        }

        return message;
    }

    /**
     * Updates a single {@link Message} matches with the given id.
     * <p>
     * Status Code:
     * Not Found  404
     * Not Matches 412
     *
     * @param credentials injected by {@link RobeAuth} annotation for authentication.
     * @param id          This is the oid of {@link Message}
     * @param model       data of {@link Message}
     * @return Updates a single {@link Message} matches with the given id.
     */
    @RobeService(group = "Message", description = "Updates a single Message matches with the given id.")
    @PUT
    @UnitOfWork
    @Path("{id}")
    public Message update(@RobeAuth Credentials credentials, @PathParam("id") String id, @Valid Message model) {

        if (!id.equals(model.getOid())) {
            throw new WebApplicationException(Response.status(412).build());
        }
        Message entity = messageDao.findById(id);
        if (entity == null) {
            throw new WebApplicationException(Response.status(404).build());
        }
        messageDao.detach(entity);
        return messageDao.update(model);
    }

    /**
     * Updates a single {@link Message} matches with the given id.
     * <p>
     * Status Code:
     * Not Found  404
     * Not Matches 412
     *
     * @param credentials injected by {@link RobeAuth} annotation for authentication.
     * @param id          This is the oid of {@link Message}
     * @param model       data of {@link Message}
     * @return Updates a single {@link Message} matches with the given id.
     */
    @RobeService(group = "Message", description = "Updates a single Message matches with the given id.")
    @PATCH
    @UnitOfWork
    @Path("{id}")
    public Message merge(@RobeAuth Credentials credentials, @PathParam("id") String id, User model) {
        if (!id.equals(model.getOid()))
            throw new WebApplicationException(Response.status(412).build());
        Message dest = messageDao.findById(id);
        if (dest == null) {
            throw new WebApplicationException(Response.status(404).build());
        }
        return messageDao.update(dest);
    }

    /**
     * Deletes a single {@link Message} matches with the given id.
     * <p>
     * Status Code:
     * Not Found  404
     * Not Matches 412
     *
     * @param credentials injected by {@link RobeAuth} annotation for authentication.
     * @param id          This is the oid of {@link Message}
     * @param model       data of {@link Message}
     * @return delete a single {@link Message} matches with the given id.
     */
    @RobeService(group = "Message", description = "Deletes a single Message matches with the given id.")
    @DELETE
    @UnitOfWork
    @Path("{id}")
    public Message delete(@RobeAuth Credentials credentials, @PathParam("id") String id, @Valid Message model) {
        if (!id.equals(model.getOid())) {
            throw new WebApplicationException(Response.status(412).build());
        }
        Message entity = messageDao.findById(id);
        if (entity == null) {
            throw new WebApplicationException(Response.status(404).build());
        }
        return messageDao.delete(entity);
    }


    @RobeService(group = "Message", description = "Return unread Message count.")
    @GET
    @Path("unreadcount")
    @UnitOfWork(readOnly = true, cacheMode = CacheMode.GET, flushMode = FlushMode.MANUAL)
    public Object getUnReadCount(@RobeAuth Credentials credentials) {
        return messageDao.unreadCountByReceiverId(credentials.getUserId());
    }

    @RobeService(group = "Message", description = "Return Message resource and matches with the given id.")
    @Path("users")
    @GET
    @UnitOfWork(readOnly = true, cacheMode = GET, flushMode = FlushMode.MANUAL)
    public List<Map<String, Object>> getUsers(@RobeAuth Credentials credentials, @SearchParam SearchModel search) {

        List<User> userList = userDao.findAllStrict(search);
        List<Map<String, Object>> list = new ArrayList<>();
        for (User user : userList) {
            Map<String, Object> map = new HashMap<>();
            map.put("user", user);
            map.put("count", messageDao.unreadCount(user.getOid(), credentials.getUserId()));
            list.add(map);
        }
        return list;
    }

    @RobeService(group = "Message", description = "Return Message resource and matches with the given id.")
    @Path("users/{userOid}")
    @GET
    @UnitOfWork(readOnly = true, cacheMode = GET, flushMode = FlushMode.MANUAL)
    public List<Message> getMessagesByUserId(@RobeAuth Credentials credentials, @PathParam("userOid") String userOid, @SearchParam SearchModel search) {
        User entity = userDao.findById(credentials.getUserId());
        if (entity != null) {
            updateUnReadMessages(credentials, userOid);
            return messageDao.getAllMessages(userOid, credentials.getUserId(), search);
        } else {
            throw new RobeRuntimeException("HATA", "Kullanıcı bulunamadı!");
        }
    }


    @RobeService(group = "Message", description = "Return Message resource and matches with the given id.")
    @Path("update/users/{userOid}")
    @POST
    @UnitOfWork
    public List<Message> updateUnReadMessages(@RobeAuth Credentials credentials, @PathParam("userOid") String userOid) {

        List<Message> messages = messageDao.unreadMessages(userOid, credentials.getUserId());
        for (Message message : messages) {
            message.setReadingStatus(true);
            message = messageDao.update(message);
        }
        return messages;
    }

}
