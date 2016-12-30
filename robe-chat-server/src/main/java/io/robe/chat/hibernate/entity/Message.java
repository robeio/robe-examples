package io.robe.chat.hibernate.entity;

import io.robe.common.service.search.SearchIgnore;
import io.robe.hibernate.entity.BaseEntity;
import org.hibernate.validator.constraints.Length;
import org.hibernate.validator.constraints.NotEmpty;

import javax.persistence.Column;
import javax.persistence.Entity;
import java.util.Date;

@Entity
public class Message extends BaseEntity {

    @SearchIgnore
    @Length(min = 32, max = 32)
    @NotEmpty
    @Column(nullable = false, updatable = false, length = 32)
    private String ownerOid;

    @SearchIgnore
    @Length(min = 32, max = 32)
    @NotEmpty
    @Column(nullable = false, updatable = false, length = 32)
    private String receiverOid;

    @Length(min = 1, max = 200)
    @Column(nullable = false, updatable = false)
    private String content;

    @Column(nullable = false, updatable = false)
    private Date creationDate;

    @Column(nullable = false)
    private boolean readingStatus = false;

    public Message() {

    }

    public String getOwnerOid() {
        return ownerOid;
    }

    public void setOwnerOid(String ownerOid) {
        this.ownerOid = ownerOid;
    }

    public String getReceiverOid() {
        return receiverOid;
    }

    public void setReceiverOid(String receiverOid) {
        this.receiverOid = receiverOid;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Date getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(Date creationDate) {
        this.creationDate = creationDate;
    }

    public boolean isReadingStatus() {
        return readingStatus;
    }

    public void setReadingStatus(boolean readingStatus) {
        this.readingStatus = readingStatus;
    }
}
