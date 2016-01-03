
-- --------------------------------------------------
-- Entity Designer DDL Script for SQL Server 2005, 2008, 2012 and Azure
-- --------------------------------------------------
-- Date Created: 01/03/2016 15:42:36
-- Generated from EDMX file: D:\GitHub\Repos\Money-Counter\MoneyCounter\Models\MoneyCounterModel.edmx
-- --------------------------------------------------

SET QUOTED_IDENTIFIER OFF;
GO
USE [MoneyCounterDB];
GO
IF SCHEMA_ID(N'dbo') IS NULL EXECUTE(N'CREATE SCHEMA [dbo]');
GO

-- --------------------------------------------------
-- Dropping existing FOREIGN KEY constraints
-- --------------------------------------------------

IF OBJECT_ID(N'[dbo].[FK_CategoryRecurrence]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[Recurrences] DROP CONSTRAINT [FK_CategoryRecurrence];
GO
IF OBJECT_ID(N'[dbo].[FK_CategoryTransaction]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[Transactions] DROP CONSTRAINT [FK_CategoryTransaction];
GO
IF OBJECT_ID(N'[dbo].[FK_UserCategory]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[Categories] DROP CONSTRAINT [FK_UserCategory];
GO
IF OBJECT_ID(N'[dbo].[FK_UserRecurrence]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[Recurrences] DROP CONSTRAINT [FK_UserRecurrence];
GO
IF OBJECT_ID(N'[dbo].[FK_UserTransaction]', 'F') IS NOT NULL
    ALTER TABLE [dbo].[Transactions] DROP CONSTRAINT [FK_UserTransaction];
GO

-- --------------------------------------------------
-- Dropping existing tables
-- --------------------------------------------------

IF OBJECT_ID(N'[dbo].[Categories]', 'U') IS NOT NULL
    DROP TABLE [dbo].[Categories];
GO
IF OBJECT_ID(N'[dbo].[Recurrences]', 'U') IS NOT NULL
    DROP TABLE [dbo].[Recurrences];
GO
IF OBJECT_ID(N'[dbo].[Transactions]', 'U') IS NOT NULL
    DROP TABLE [dbo].[Transactions];
GO
IF OBJECT_ID(N'[dbo].[Users]', 'U') IS NOT NULL
    DROP TABLE [dbo].[Users];
GO

-- --------------------------------------------------
-- Creating all tables
-- --------------------------------------------------

-- Creating table 'Transactions'
CREATE TABLE [dbo].[Transactions] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Date] datetime  NOT NULL,
    [Amount] decimal(18,2)  NOT NULL,
    [Type] nvarchar(max)  NOT NULL,
    [Description] nvarchar(80)  NULL,
    [Category_Id] int  NOT NULL,
    [User_Id] int  NOT NULL
);
GO

-- Creating table 'Categories'
CREATE TABLE [dbo].[Categories] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Name] nvarchar(20)  NULL,
    [TransactionType] nvarchar(max)  NOT NULL,
    [Color] nvarchar(max)  NULL,
    [Default] bit  NOT NULL,
    [User_Id] int  NOT NULL
);
GO

-- Creating table 'Users'
CREATE TABLE [dbo].[Users] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Email] nvarchar(max)  NOT NULL,
    [Password] nvarchar(max)  NOT NULL,
    [FirstName] nvarchar(20)  NULL,
    [LastName] nvarchar(40)  NULL,
    [UserType] nvarchar(max)  NOT NULL
);
GO

-- Creating table 'Recurrences'
CREATE TABLE [dbo].[Recurrences] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Amount] decimal(18,2)  NOT NULL,
    [Description] nvarchar(80)  NULL,
    [TimeInterval] smallint  NOT NULL,
    [TransactionType] nvarchar(max)  NOT NULL,
    [Category_Id] int  NOT NULL,
    [User_Id] int  NOT NULL
);
GO

-- --------------------------------------------------
-- Creating all PRIMARY KEY constraints
-- --------------------------------------------------

-- Creating primary key on [Id] in table 'Transactions'
ALTER TABLE [dbo].[Transactions]
ADD CONSTRAINT [PK_Transactions]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'Categories'
ALTER TABLE [dbo].[Categories]
ADD CONSTRAINT [PK_Categories]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'Users'
ALTER TABLE [dbo].[Users]
ADD CONSTRAINT [PK_Users]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- Creating primary key on [Id] in table 'Recurrences'
ALTER TABLE [dbo].[Recurrences]
ADD CONSTRAINT [PK_Recurrences]
    PRIMARY KEY CLUSTERED ([Id] ASC);
GO

-- --------------------------------------------------
-- Creating all FOREIGN KEY constraints
-- --------------------------------------------------

-- Creating foreign key on [Category_Id] in table 'Transactions'
ALTER TABLE [dbo].[Transactions]
ADD CONSTRAINT [FK_CategoryTransaction]
    FOREIGN KEY ([Category_Id])
    REFERENCES [dbo].[Categories]
        ([Id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_CategoryTransaction'
CREATE INDEX [IX_FK_CategoryTransaction]
ON [dbo].[Transactions]
    ([Category_Id]);
GO

-- Creating foreign key on [User_Id] in table 'Transactions'
ALTER TABLE [dbo].[Transactions]
ADD CONSTRAINT [FK_UserTransaction]
    FOREIGN KEY ([User_Id])
    REFERENCES [dbo].[Users]
        ([Id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_UserTransaction'
CREATE INDEX [IX_FK_UserTransaction]
ON [dbo].[Transactions]
    ([User_Id]);
GO

-- Creating foreign key on [Category_Id] in table 'Recurrences'
ALTER TABLE [dbo].[Recurrences]
ADD CONSTRAINT [FK_CategoryRecurrence]
    FOREIGN KEY ([Category_Id])
    REFERENCES [dbo].[Categories]
        ([Id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_CategoryRecurrence'
CREATE INDEX [IX_FK_CategoryRecurrence]
ON [dbo].[Recurrences]
    ([Category_Id]);
GO

-- Creating foreign key on [User_Id] in table 'Recurrences'
ALTER TABLE [dbo].[Recurrences]
ADD CONSTRAINT [FK_UserRecurrence]
    FOREIGN KEY ([User_Id])
    REFERENCES [dbo].[Users]
        ([Id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_UserRecurrence'
CREATE INDEX [IX_FK_UserRecurrence]
ON [dbo].[Recurrences]
    ([User_Id]);
GO

-- Creating foreign key on [User_Id] in table 'Categories'
ALTER TABLE [dbo].[Categories]
ADD CONSTRAINT [FK_UserCategory]
    FOREIGN KEY ([User_Id])
    REFERENCES [dbo].[Users]
        ([Id])
    ON DELETE NO ACTION ON UPDATE NO ACTION;
GO

-- Creating non-clustered index for FOREIGN KEY 'FK_UserCategory'
CREATE INDEX [IX_FK_UserCategory]
ON [dbo].[Categories]
    ([User_Id]);
GO

-- --------------------------------------------------
-- Script has ended
-- --------------------------------------------------