def test(api_key, secret_key):
    import get_compute
    th = get_compute.compute()
    th.run(api_key, secret_key)

    import get_storage
    th = get_storage.storage()
    th.run(api_key, secret_key)

    import get_db
    th = get_db.db()
    th.run(api_key, secret_key)

    import get_container
    th = get_container.container()
    th.run(api_key, secret_key)

    import get_network
    th = get_network.network()
    th.run(api_key, secret_key)

    import get_integration
    th = get_integration.integration()
    th.run(api_key, secret_key)

    import get_iam
    th = get_iam.iam()
    th.run(api_key, secret_key)

    import get_security
    th = get_security.security()
    th.run(api_key, secret_key)


if __name__ == '__main__':
    import sys
    test(sys.argv[1], sys.argv[2])  
    from datetime import datetime

    print("{} - The scheduled job AWS is over".format(datetime.now()))
